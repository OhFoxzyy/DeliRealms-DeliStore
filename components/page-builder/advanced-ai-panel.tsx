"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, Check, X, AlertTriangle, Trash2, Plus, Edit3, LayoutTemplate, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { usePageBuilder } from './page-builder-context';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  plan?: AIPlan;
  actions?: AIAction[];
}

interface AIPlan {
  goal: string;
  steps: string[];
  risks?: string[];
}

interface AIAction {
  id: string;
  type: 'create_component' | 'remove_component' | 'modify_component' | 'create_page' | 'delete_page' | 'modify_theme' | 'modify_styles';
  description: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  data?: any;
}

interface AdvancedAIPanelProps {
  projectId: string;
  pageId: string;
}

export function AdvancedAIPanel({ projectId, pageId }: AdvancedAIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you build pages, create components, manage themes, and even create or delete pages. Just tell me what you want to do!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alwaysConfirm, setAlwaysConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { elements, theme } = usePageBuilder();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getPageContext = () => {
    return {
      elementCount: elements.length,
      elements: elements.map(el => ({ type: el.type, id: el.id })),
      theme: theme ? {
        name: theme.name,
        palette: theme.palette,
      } : null
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = getPageContext();
      
      // First, ask AI to create a plan
      const planResponse = await fetch(`/api/projects/${projectId}/pages/${pageId}/ai/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          context,
          conversationHistory: messages.slice(-5),
        }),
      });

      if (!planResponse.ok) throw new Error('Failed to create plan');
      
      const { plan, actions } = await planResponse.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand. Here's my plan:\n\n**Goal:** ${plan.goal}\n\n**Steps:**\n${plan.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}${plan.risks?.length ? `\n\n**Note:** ${plan.risks.join(' ')}` : ''}`,
        timestamp: new Date(),
        plan,
        actions: actions || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If alwaysConfirm is enabled, automatically confirm all actions
      if (alwaysConfirm && actions && actions.length > 0) {
        setTimeout(() => handleConfirmAllActions(assistantMessage.id, actions), 500);
      }
    } catch (error) {
      console.error('[v0] AI error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process request'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAllActions = async (messageId: string, actions: AIAction[]) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.actions) {
        return {
          ...msg,
          actions: msg.actions.map(action => ({ ...action, status: 'confirmed' as const }))
        };
      }
      return msg;
    }));

    await executeActions(actions);
  };

  const handleConfirmAction = async (messageId: string, actionId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.actions) {
        return {
          ...msg,
          actions: msg.actions.map(action => 
            action.id === actionId ? { ...action, status: 'confirmed' as const } : action
          )
        };
      }
      return msg;
    }));

    const message = messages.find(m => m.id === messageId);
    const action = message?.actions?.find(a => a.id === actionId);
    if (action) {
      await executeActions([action]);
    }
  };

  const handleRejectAction = (messageId: string, actionId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.actions) {
        return {
          ...msg,
          actions: msg.actions.map(action => 
            action.id === actionId ? { ...action, status: 'rejected' as const } : action
          )
        };
      }
      return msg;
    }));
  };

  const executeActions = async (actions: AIAction[]) => {
    for (const action of actions) {
      try {
        const response = await fetch(`/api/projects/${projectId}/pages/${pageId}/ai/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        if (response.ok) {
          setMessages(prev => prev.map(msg => ({
            ...msg,
            actions: msg.actions?.map(a => 
              a.id === action.id ? { ...a, status: 'completed' as const } : a
            )
          })));
        }
      } catch (error) {
        console.error('[v0] Failed to execute action:', error);
      }
    }
  };

  const getActionIcon = (type: AIAction['type']) => {
    switch (type) {
      case 'create_component': return <Plus className="h-3 w-3" />;
      case 'remove_component': return <Trash2 className="h-3 w-3" />;
      case 'modify_component': return <Edit3 className="h-3 w-3" />;
      case 'create_page': return <LayoutTemplate className="h-3 w-3" />;
      case 'delete_page': return <Trash2 className="h-3 w-3" />;
      default: return <Sparkles className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (status: AIAction['status']) => {
    switch (status) {
      case 'confirmed': return <Check className="h-3 w-3 text-green-400" />;
      case 'rejected': return <X className="h-3 w-3 text-red-400" />;
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      default: return <Circle className="h-3 w-3 text-neutral-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border-r border-neutral-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-neutral-400">Planning mode enabled</p>
          </div>
        </div>
        
        {/* Always confirm toggle */}
        <div className="flex items-center gap-2 mt-3">
          <Checkbox 
            id="always-confirm" 
            checked={alwaysConfirm}
            onCheckedChange={(checked) => setAlwaysConfirm(checked as boolean)}
            className="border-neutral-700"
          />
          <label htmlFor="always-confirm" className="text-xs text-neutral-400 cursor-pointer">
            Skip confirmation for all actions
          </label>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn(
              "flex gap-3",
              message.role === 'user' && "flex-row-reverse"
            )}>
              {message.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
              
              <div className={cn(
                "flex-1 space-y-2",
                message.role === 'user' && "flex justify-end"
              )}>
                <div className={cn(
                  "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                  message.role === 'user' && "bg-neutral-800 text-white ml-auto",
                  message.role === 'assistant' && "bg-neutral-900 text-neutral-200 border border-neutral-800",
                  message.role === 'system' && "bg-red-950/30 text-red-400 border border-red-900/30"
                )}>
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  
                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-medium text-neutral-400 mb-2">Actions required:</div>
                      {message.actions.map((action) => (
                        <div 
                          key={action.id}
                          className="flex items-center justify-between gap-2 p-2 rounded bg-black/40 border border-neutral-800"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="shrink-0 text-neutral-400">
                              {getActionIcon(action.type)}
                            </div>
                            <span className="text-xs text-neutral-300 truncate">
                              {action.description}
                            </span>
                            <div className="shrink-0 ml-auto">
                              {getStatusIcon(action.status)}
                            </div>
                          </div>
                          
                          {action.status === 'pending' && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-950/30"
                                onClick={() => handleConfirmAction(message.id, action.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                onClick={() => handleRejectAction(message.id, action.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {message.actions.some(a => a.status === 'pending') && (
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          onClick={() => handleConfirmAllActions(message.id, message.actions!)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Confirm All
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "text-xs text-neutral-500 px-3",
                  message.role === 'user' && "text-right"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Loader2 className="h-3 w-3 text-white animate-spin" />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-400">
                Planning your request...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950 shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask me to create a hero section, modify colors, or even create a new page..."
            className="flex-1 bg-black border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-purple-500"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {['Add hero section', 'Create pricing table', 'New page', 'Change theme'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300 border border-neutral-800 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
