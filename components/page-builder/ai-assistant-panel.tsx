"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Sparkles, Send, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePageBuilder } from './page-builder-context';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: {
    type: 'add-component' | 'edit-component' | 'create-theme' | 'clarify';
    data?: any;
  };
}

interface AIAssistantPanelProps {
  projectId: string;
  pageId: string;
}

export function AIAssistantPanel({ projectId, pageId }: AIAssistantPanelProps) {
  const { elements, addElement, setElements, theme, setTheme } = usePageBuilder();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you build your page, create components, and customize themes. What would you like to create?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      // Prepare context for AI
      const context = {
        elements: elements.map((el) => ({
          type: el.type,
          content: el.content,
        })),
        theme: theme || null,
        elementCount: elements.length,
      };

      const response = await fetch(`/api/projects/${projectId}/pages/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.trim(),
          context,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Generation failed');

      // Handle different types of responses
      if (data.question) {
        // AI is asking for clarification
        const clarifyMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.question,
          timestamp: new Date(),
          action: {
            type: 'clarify',
          },
        };
        setMessages((prev) => [...prev, clarifyMessage]);
      } else if (data.theme) {
        // AI created a theme
        setTheme(data.theme);
        const themeMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || `I've created a new theme called "${data.theme.name}". The colors have been applied to your page.`,
          timestamp: new Date(),
          action: {
            type: 'create-theme',
            data: data.theme,
          },
        };
        setMessages((prev) => [...prev, themeMessage]);
        toast.success('Theme created and applied');
      } else if (data.elements && data.elements.length > 0) {
        // AI generated components
        data.elements.forEach((element: any) => {
          addElement(element);
        });
        const componentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || `I've added ${data.elements.length} component(s) to your page. You can select them to customize further.`,
          timestamp: new Date(),
          action: {
            type: 'add-component',
            data: data.elements,
          },
        };
        setMessages((prev) => [...prev, componentMessage]);
        toast.success(`Added ${data.elements.length} component(s)`);
      } else if (data.customComponent) {
        // AI created a custom component
        const newComponent = {
          id: `custom-${Date.now()}`,
          ...data.customComponent,
        };
        addElement(newComponent);
        const customMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || "I've created a custom component for you!",
          timestamp: new Date(),
          action: {
            type: 'add-component',
            data: [newComponent],
          },
        };
        setMessages((prev) => [...prev, customMessage]);
        toast.success('Custom component created');
      } else {
        // Generic response
        const genericMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || "I'm not sure what you'd like me to do. Can you be more specific?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, genericMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error('Failed to process request');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">AI Assistant</h2>
            <p className="text-xs text-[#737373]">Build and customize with AI</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.role === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30'
              )}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-purple-400" />
                )}
              </div>
              <div className={cn(
                "flex-1 max-w-[85%]",
                message.role === 'user' ? 'items-end' : 'items-start',
                "flex flex-col"
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-2xl",
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#171717] text-[#e5e5e5] border border-[#262626]'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.action && (
                  <div className="mt-2 text-xs text-[#737373] flex items-center gap-1">
                    {message.action.type === 'add-component' && '✓ Components added'}
                    {message.action.type === 'create-theme' && '✓ Theme applied'}
                    {message.action.type === 'clarify' && '? Needs clarification'}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="px-4 py-3 rounded-2xl bg-[#171717] border border-[#262626]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    <span className="text-sm text-[#a3a3a3]">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#262626] shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Describe what you want to build..."
            disabled={isGenerating}
            className="min-h-[60px] max-h-[120px] bg-[#171717] border-[#262626] text-[#e5e5e5] resize-none"
            rows={2}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 self-end"
            size="icon"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-[#525252] mt-2">
          Try: "Add a hero section", "Create a dark theme", "Make a custom pricing card"
        </p>
      </div>
    </div>
  );
}
