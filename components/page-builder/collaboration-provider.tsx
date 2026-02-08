"use client";

"use client";

import React, { useEffect, useRef, useState } from 'react';
import { CollaborationManager, CollaborationEvent } from '@/lib/realtime/collaboration';
import { usePageBuilder } from './page-builder-context';
import { useSession } from 'next-auth/react';

export function CollaborationProvider({ pageId, children }: { pageId: string; children: React.ReactNode }) {
  const { elements, setElements, updateElement, addElement, deleteElement, selectElement } = usePageBuilder();
  const { data: session } = useSession();
  const managerRef = useRef<CollaborationManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.user?.id || !pageId) return;

    const manager = new CollaborationManager(pageId, session.user.id);
    managerRef.current = manager;

    manager.on('connected', () => {
      setIsConnected(true);
    });

    manager.on('disconnected', () => {
      setIsConnected(false);
    });

    manager.on('remote_change', (event: CollaborationEvent) => {
      switch (event.type) {
        case 'element_added':
          addElement(event.data.element);
          break;
        case 'element_updated':
          updateElement(event.data.elementId, event.data.updates);
          break;
        case 'element_deleted':
          deleteElement(event.data.elementId);
          break;
        case 'element_moved':
          // Handle move operation
          break;
        case 'selection_changed':
          // Update selection indicator
          break;
      }
    });

    manager.connect();

    return () => {
      manager.disconnect();
    };
  }, [pageId, session?.user?.id]);

  // Send local changes to server
  useEffect(() => {
    if (!managerRef.current || !isConnected) return;

    // This would be called when elements change locally
    // For now, we'll rely on explicit calls from the page builder
  }, [elements]);

  return (
    <>
      {children}
      {isConnected && (
        <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1.5 text-xs text-green-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {activeUsers.size} user{activeUsers.size !== 1 ? 's' : ''} online
        </div>
      )}
    </>
  );
}
