"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, ChevronDown, ChevronUp, MoreHorizontal, Check, X, Loader2, AlertCircle, Download, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plan?: {
    goal: string;
    steps: string[];
    risks?: string[];
  };
  actions?: Array<{
    id: string;
    type: string;
    description: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    data?: any;
  }>;
  todos?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}

interface EnhancedAIPanelProps {
  projectId: string;
  pageId: string;
}

export function EnhancedAIPanel({ projectId, pageId }: EnhancedAIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleExpanded = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get current page context
      const pageResponse = await fetch(`/api/projects/${projectId}/pages/${pageId}`);
      const pageData = await pageResponse.json();

      // Generate AI plan
      const planResponse = await fetch(`/api/projects/${projectId}/pages/${pageId}/ai/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          context: {
            elements: pageData.elements || [],
            theme: pageData.theme || {},
            elementCount: (pageData.elements || []).length,
          },
          conversationHistory: messages.slice(-4),
        }),
      });

      if (!planResponse.ok) throw new Error('Failed to generate plan');

      const planData = await planResponse.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: planData.plan?.goal || 'I have created a plan for you.',
        timestamp: new Date(),
        plan: planData.plan,
        actions: planData.actions?.map((action: any) => ({
          ...action,
          status: 'pending' as const,
        })) || [],
        todos: [],
      };

      setMessages(prev => [...prev, assistantMessage]);
      setExpandedMessages(prev => new Set([...prev, assistantMessage.id]));

      // Auto-execute if skipConfirmation is enabled
      if (skipConfirmation && planData.actions?.length > 0) {
        await executeActions(assistantMessage.id, planData.actions);
      }
    } catch (error) {
      console.error('[v0] AI error:', error);
      toast.error('Failed to process your request');
    } finally {
      setIsLoading(false);
    }
  };

  const executeActions = async (messageId: string, actions: any[]) => {
    for (const action of actions) {
      // Update action status to executing
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                actions: msg.actions?.map(a =>
                  a.id === action.id ? { ...a, status: 'executing' as const } : a
                ),
              }
            : msg
        )
      );

      try {
        const response = await fetch(`/api/projects/${projectId}/pages/${pageId}/ai/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        if (!response.ok) throw new Error('Action failed');

        // Update to completed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  actions: msg.actions?.map(a =>
                    a.id === action.id ? { ...a, status: 'completed' as const } : a
                  ),
                }
              : msg
          )
        );

        toast.success(action.description);
      } catch (error) {
        // Update to failed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  actions: msg.actions?.map(a =>
                    a.id === action.id ? { ...a, status: 'failed' as const } : a
                  ),
                }
              : msg
          )
        );

        toast.error(`Failed: ${action.description}`);
      }
    }
  };

  const handleExecuteAction = async (messageId: string, actionId: string) => {
    const message = messages.find(m => m.id === messageId);
    const action = message?.actions?.find(a => a.id === actionId);
    if (!action) return;

    await executeActions(messageId, [action]);
  };

  const handleExecuteAll = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    const pendingActions = message?.actions?.filter(a => a.status === 'pending') || [];
    
    if (pendingActions.length === 0) return;
    await executeActions(messageId, pendingActions);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="border-b border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-neutral-400">Planning-based intelligent builder</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
            <input
              type="checkbox"
              checked={skipConfirmation}
              onChange={(e) => setSkipConfirmation(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-900 text-purple-500"
            />
            Skip confirmation
          </label>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto text-neutral-700 mb-4" />
              <h4 className="text-sm font-medium text-neutral-400 mb-2">AI Assistant Ready</h4>
              <p className="text-xs text-neutral-500">
                I can help you build pages, create components, modify themes, and more.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={cn(
              "space-y-2",
              message.role === 'user' ? 'ml-8' : ''
            )}>
              {/* User Message */}
              {message.role === 'user' && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                  <p className="text-sm text-white">{message.content}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Assistant Message */}
              {message.role === 'assistant' && (
                <div className="space-y-2">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-900/50 transition-colors"
                      onClick={() => toggleExpanded(message.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <ChevronDown className={cn(
                          "h-4 w-4 text-neutral-400 transition-transform",
                          !expandedMessages.has(message.id) && "-rotate-90"
                        )} />
                        <p className="text-sm text-white font-medium">{message.content}</p>
                      </div>
                      <button className="p-1 hover:bg-neutral-800 rounded">
                        <MoreHorizontal className="h-4 w-4 text-neutral-400" />
                      </button>
                    </div>

                    {/* Expandable Content */}
                    {expandedMessages.has(message.id) && (
                      <div className="border-t border-neutral-800">
                        {/* Plan Steps */}
                        {message.plan && (
                          <div className="p-3 space-y-2 bg-neutral-900/30">
                            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Plan</h4>
                            <ul className="space-y-1.5">
                              {message.plan.steps.map((step, idx) => (
                                <li key={idx} className="text-xs text-neutral-400 flex gap-2">
                                  <span className="text-purple-400 font-mono">{idx + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                            {message.plan.risks && message.plan.risks.length > 0 && (
                              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-3.5 w-3.5 text-yellow-400 mt-0.5" />
                                  <div className="space-y-1">
                                    {message.plan.risks.map((risk, idx) => (
                                      <p key={idx} className="text-xs text-yellow-200">{risk}</p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        {message.actions && message.actions.length > 0 && (
                          <div className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Actions</h4>
                              {message.actions.some(a => a.status === 'pending') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExecuteAll(message.id)}
                                  className="h-6 text-xs bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20"
                                >
                                  Execute All
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {message.actions.map((action) => (
                                <div
                                  key={action.id}
                                  className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded text-xs"
                                >
                                  {action.status === 'pending' && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => handleExecuteAction(message.id, action.id)}
                                    >
                                      <Check className="h-3.5 w-3.5 text-neutral-400" />
                                    </Button>
                                  )}
                                  {action.status === 'executing' && (
                                    <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                                  )}
                                  {action.status === 'completed' && (
                                    <Check className="h-4 w-4 text-green-400" />
                                  )}
                                  {action.status === 'failed' && (
                                    <X className="h-4 w-4 text-red-400" />
                                  )}
                                  <span className={cn(
                                    "flex-1",
                                    action.status === 'completed' && "text-neutral-500 line-through",
                                    action.status === 'failed' && "text-red-400",
                                    action.status === 'pending' && "text-neutral-300",
                                    action.status === 'executing' && "text-purple-300"
                                  )}>
                                    {action.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 ml-6">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-neutral-800 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Describe what you want to build..."
            className="flex-1 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
