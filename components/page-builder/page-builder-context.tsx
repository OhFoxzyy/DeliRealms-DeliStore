"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import type { PageElement, PageTheme, ElementStyle } from '@/lib/page-builder/types';

interface PageBuilderContextType {
  elements: PageElement[];
  selectedElement: PageElement | null;
  selectedElementId: string | null;
  theme: PageTheme | null;
  setElements: (elements: PageElement[]) => void;
  selectElement: (idOrElement: string | PageElement | null) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  deleteElement: (id: string) => void;
  addElement: (element: PageElement, parentId?: string) => void;
  addElementAt: (element: PageElement, parentId: string | null, index: number) => void;
  moveElement: (id: string, direction: 'up' | 'down') => void;
  moveElementTo: (id: string, targetParentId: string | null, targetIndex: number) => void;
  duplicateElement: (id: string) => void;
  setTheme: (theme: PageTheme | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  copiedStyle: ElementStyle | null;
  copyStyle: (id: string) => void;
  pasteStyle: (id: string) => void;
  moveElementToTop: (id: string) => void;
  moveElementToBottom: (id: string) => void;
  wrapInContainer: (id: string) => void;
  convertToSection: (id: string) => void;
}

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

export function PageBuilderProvider({ 
  children, 
  initialElements = [],
  initialTheme = null,
}: { 
  children: React.ReactNode;
  initialElements?: PageElement[];
  initialTheme?: PageTheme | null;
}) {
  const [elements, setElements] = useState<PageElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null);
  const [theme, setTheme] = useState<PageTheme | null>(initialTheme);
  const [copiedStyle, setCopiedStyle] = useState<ElementStyle | null>(null);
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

  const addElementAt = useCallback((element: PageElement, parentId: string | null, index: number) => {
    setElements((prev) => {
      const insertAt = (items: PageElement[], targetParentId: string | null, targetIndex: number): PageElement[] => {
        if (targetParentId === null) {
          const result = [...items];
          result.splice(targetIndex, 0, element);
          return result;
        }
        return items.map((item) => {
          if (item.id === targetParentId) {
            const children = item.children || [];
            const newChildren = [...children];
            newChildren.splice(targetIndex, 0, element);
            return { ...item, children: newChildren };
          }
          if (item.children) {
            return { ...item, children: insertAt(item.children, targetParentId, targetIndex) };
          }
          return item;
        });
      };
      const newElements = insertAt(prev, parentId, index);
      saveToHistory(newElements);
      return newElements;
    });
  }, [saveToHistory]);

  const moveElement = useCallback((id: string, direction: 'up' | 'down') => {
    setElements((prev) => {
      const findLocation = (items: PageElement[], parentId: string | null): { parentId: string | null; index: number; siblings: PageElement[] } | null => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === id) return { parentId, index: i, siblings: items };
          if (items[i].children) {
            const found = findLocation(items[i].children!, items[i].id);
            if (found) return found;
          }
        }
        return null;
      };
      const loc = findLocation(prev, null);
      if (!loc) return prev;
      const { index, siblings } = loc;
      const newIdx = direction === 'up' ? index - 1 : index + 1;
      if (newIdx < 0 || newIdx >= siblings.length) return prev;
      const newSiblings = [...siblings];
      [newSiblings[index], newSiblings[newIdx]] = [newSiblings[newIdx], newSiblings[index]];
      const applyNewSiblings = (items: PageElement[], targetParentId: string | null): PageElement[] => {
        if (targetParentId === null) return newSiblings;
        return items.map((item) => {
          if (item.id === targetParentId) return { ...item, children: newSiblings };
          if (item.children) return { ...item, children: applyNewSiblings(item.children, targetParentId) };
          return item;
        });
      };
      const result = applyNewSiblings(prev, loc.parentId);
      saveToHistory(result);
      return result;
    });
  }, [saveToHistory]);

  const moveElementTo = useCallback((id: string, targetParentId: string | null, targetIndex: number) => {
    setElements((prev) => {
      const extract = (items: PageElement[], parentId: string | null): { el: PageElement | null; rest: PageElement[] } => {
        const i = items.findIndex((e) => e.id === id);
        if (i >= 0) {
          const el = items[i];
          const rest = items.slice(0, i).concat(items.slice(i + 1));
          return { el, rest };
        }
        for (let j = 0; j < items.length; j++) {
          if (items[j].children) {
            const { el, rest } = extract(items[j].children!, items[j].id);
            if (el) {
              const next = items.slice();
              next[j] = { ...items[j], children: rest.length ? rest : undefined };
              return { el, rest: next };
            }
          }
        }
        return { el: null, rest: items };
      };
      const insertAt = (items: PageElement[], pId: string | null, idx: number, el: PageElement): PageElement[] => {
        if (pId === null) {
          const r = [...items];
          r.splice(idx, 0, el);
          return r;
        }
        return items.map((item) => {
          if (item.id === pId) {
            const ch = [...(item.children || [])];
            ch.splice(idx, 0, el);
            return { ...item, children: ch };
          }
          if (item.children) return { ...item, children: insertAt(item.children, pId, idx, el) };
          return item;
        });
      };
      const { el, rest } = extract(prev, null);
      if (!el) return prev;
      const next = insertAt(rest, targetParentId, targetIndex, el);
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const moveElementToTop = useCallback((id: string) => {
    setElements((prev) => {
      const extract = (items: PageElement[]): { el: PageElement | null; rest: PageElement[] } => {
        const i = items.findIndex((e) => e.id === id);
        if (i >= 0) {
          const el = items[i];
          const rest = items.slice(0, i).concat(items.slice(i + 1));
          return { el, rest };
        }
        for (let j = 0; j < items.length; j++) {
          if (items[j].children) {
            const { el, rest } = extract(items[j].children!);
            if (el) {
              const next = items.slice();
              next[j] = { ...items[j], children: rest.length ? rest : undefined };
              return { el, rest: next };
            }
          }
        }
        return { el: null, rest: items };
      };
      const { el, rest } = extract(prev);
      if (!el) return prev;
      const next = [el, ...rest];
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const moveElementToBottom = useCallback((id: string) => {
    setElements((prev) => {
      const extract = (items: PageElement[]): { el: PageElement | null; rest: PageElement[] } => {
        const i = items.findIndex((e) => e.id === id);
        if (i >= 0) {
          const el = items[i];
          const rest = items.slice(0, i).concat(items.slice(i + 1));
          return { el, rest };
        }
        for (let j = 0; j < items.length; j++) {
          if (items[j].children) {
            const { el, rest } = extract(items[j].children!);
            if (el) {
              const next = items.slice();
              next[j] = { ...items[j], children: rest.length ? rest : undefined };
              return { el, rest: next };
            }
          }
        }
        return { el: null, rest: items };
      };
      const { el, rest } = extract(prev);
      if (!el) return prev;
      const next = [...rest, el];
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const copyStyle = useCallback((id: string) => {
    const find = (items: PageElement[]): ElementStyle | null => {
      for (const item of items) {
        if (item.id === id) return item.style;
        if (item.children) {
          const found = find(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    const style = find(elements);
    setCopiedStyle(style ? { ...style } : null);
  }, [elements]);

  const pasteStyle = useCallback((id: string) => {
    if (!copiedStyle) return;
    updateElement(id, { style: { ...copiedStyle } });
  }, [copiedStyle, updateElement]);

  const wrapInContainer = useCallback((id: string) => {
    setElements((prev) => {
      const container: PageElement = {
        id: `container-${Date.now()}`,
        type: 'container',
        content: {},
        style: { display: 'flex', flexDirection: 'column', padding: '20px', gap: '10px', backgroundColor: 'transparent', borderRadius: '8px' },
        children: [],
      };
      const extract = (items: PageElement[]): { el: PageElement | null; rest: PageElement[] } => {
        const i = items.findIndex((e) => e.id === id);
        if (i >= 0) {
          const el = items[i];
          const rest = items.slice(0, i).concat(items.slice(i + 1));
          return { el, rest };
        }
        for (let j = 0; j < items.length; j++) {
          if (items[j].children) {
            const { el, rest } = extract(items[j].children!);
            if (el) {
              const next = items.slice();
              next[j] = { ...items[j], children: rest.length ? rest : undefined };
              return { el, rest: next };
            }
          }
        }
        return { el: null, rest: items };
      };
      const { el, rest } = extract(prev);
      if (!el) return prev;
      container.children = [el];
      const next = [...rest, container];
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const convertToSection = useCallback((id: string) => {
    setElements((prev) => {
      const section: PageElement = {
        id: `section-${Date.now()}`,
        type: 'section',
        content: { title: '', subtitle: '' },
        style: { padding: '60px 20px', width: '100%' },
        children: [],
      };
      const extract = (items: PageElement[]): { el: PageElement | null; rest: PageElement[] } => {
        const i = items.findIndex((e) => e.id === id);
        if (i >= 0) {
          const el = items[i];
          const rest = items.slice(0, i).concat(items.slice(i + 1));
          return { el, rest };
        }
        for (let j = 0; j < items.length; j++) {
          if (items[j].children) {
            const { el, rest } = extract(items[j].children!);
            if (el) {
              const next = items.slice();
              next[j] = { ...items[j], children: rest.length ? rest : undefined };
              return { el, rest: next };
            }
          }
        }
        return { el: null, rest: items };
      };
      const { el, rest } = extract(prev);
      if (!el) return prev;
      section.children = [el];
      const next = [...rest, section];
      saveToHistory(next);
      return next;
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
        theme,
        copiedStyle,
        setElements,
        selectElement,
        updateElement,
        deleteElement,
        addElement,
        addElementAt,
        moveElement,
        moveElementTo,
        moveElementToTop,
        moveElementToBottom,
        copyStyle,
        pasteStyle,
        wrapInContainer,
        convertToSection,
        duplicateElement,
        setTheme,
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
