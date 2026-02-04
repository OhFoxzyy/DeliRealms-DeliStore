"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface PageBuilderContextType {
  elements: PageElement[];
  selectedElement: PageElement | null;
  selectedElementId: string | null;
  setElements: (elements: PageElement[]) => void;
  selectElement: (idOrElement: string | PageElement | null) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  deleteElement: (id: string) => void;
  addElement: (element: PageElement, parentId?: string) => void;
  duplicateElement: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

export function PageBuilderProvider({ 
  children, 
  initialElements = [] 
}: { 
  children: React.ReactNode;
  initialElements?: PageElement[];
}) {
  const [elements, setElements] = useState<PageElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null);
  const [history, setHistory] = useState<PageElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = useCallback((newElements: PageElement[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const selectElement = useCallback((idOrElement: string | PageElement | null) => {
    if (typeof idOrElement === 'string') {
      const findElement = (items: PageElement[]): PageElement | null => {
        for (const item of items) {
          if (item.id === idOrElement) return item;
          if (item.children) {
            const found = findElement(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      setSelectedElement(findElement(elements));
    } else {
      setSelectedElement(idOrElement);
    }
  }, [elements]);

  const updateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    setElements((prev) => {
      const updateRecursive = (items: PageElement[]): PageElement[] => {
        return items.map((item) => {
          if (item.id === id) {
            const updated = { ...item, ...updates };
            if (selectedElement?.id === id) {
              setSelectedElement(updated);
            }
            return updated;
          }
          if (item.children) {
            return { ...item, children: updateRecursive(item.children) };
          }
          return item;
        });
      };
      return updateRecursive(prev);
    });
  }, [selectedElement]);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => {
      const deleteRecursive = (items: PageElement[]): PageElement[] => {
        return items.filter((item) => {
          if (item.id === id) {
            if (selectedElement?.id === id) {
              setSelectedElement(null);
            }
            return false;
          }
          if (item.children) {
            item.children = deleteRecursive(item.children);
          }
          return true;
        });
      };
      return deleteRecursive(prev);
    });
  }, [selectedElement]);

  const addElement = useCallback((element: PageElement, parentId?: string) => {
    setElements((prev) => {
      const newElements = parentId
        ? (() => {
            const addRecursive = (items: PageElement[]): PageElement[] => {
              return items.map((item) => {
                if (item.id === parentId) {
                  return {
                    ...item,
                    children: [...(item.children || []), element],
                  };
                }
                if (item.children) {
                  return { ...item, children: addRecursive(item.children) };
                }
                return item;
              });
            };
            return addRecursive(prev);
          })()
        : [...prev, element];
      
      saveToHistory(newElements);
      return newElements;
    });
  }, [saveToHistory]);

  const duplicateElement = useCallback((id: string) => {
    setElements((prev) => {
      const duplicateRecursive = (items: PageElement[]): PageElement[] => {
        const result: PageElement[] = [];
        items.forEach((item) => {
          result.push(item);
          if (item.id === id) {
            const duplicate = JSON.parse(JSON.stringify(item));
            duplicate.id = `${duplicate.type}-${Date.now()}`;
            result.push(duplicate);
          }
          if (item.children) {
            item.children = duplicateRecursive(item.children);
          }
        });
        return result;
      };
      const newElements = duplicateRecursive(prev);
      saveToHistory(newElements);
      return newElements;
    });
  }, [saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  return (
    <PageBuilderContext.Provider
      value={{
        elements,
        selectedElement,
        selectedElementId: selectedElement?.id || null,
        setElements,
        selectElement,
        updateElement,
        deleteElement,
        addElement,
        duplicateElement,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
      }}
    >
      {children}
    </PageBuilderContext.Provider>
  );
}

export function usePageBuilder() {
  const context = useContext(PageBuilderContext);
  if (!context) {
    throw new Error('usePageBuilder must be used within PageBuilderProvider');
  }
  return context;
}
