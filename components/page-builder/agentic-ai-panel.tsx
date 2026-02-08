"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Sparkles, Send, CheckCircle2, Circle, Trash2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Todo {
  id: string;
  task: string;
  completed: boolean;
}

interface AgenticAIPanelProps {
  projectId: string;
  pageId: string;
}

export function AgenticAIPanel({ projectId, pageId }: AgenticAIPanelProps) {
  const { elements, theme, addElement, updateElement, deleteElement, setElements } = usePageBuilder();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I'm your AI design assistant. I can help you build components, modify layouts, remove elements, and create themes. What would you like to build?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContextMessage = () => {
    const context = {
      elementCount: elements.length,
      elements: elements.map(el => ({ id: el.id, type: el.type })),
      theme: theme ? {
        name: theme.name,
        palette: theme.palette,
      } : null,
      selectedElements: elements.filter(el => el.id).map(el => el.id),
    };

    return `Current page state:\n- ${context.elementCount} components\n- Theme: ${context.theme?.name || 'Default'}\n- Primary color: ${context.theme?.palette.primary || '#3b82f6'}\n- Component types: ${[...new Set(elements.map(el => el.type))].join(', ')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const contextInfo = buildContextMessage();
      
      const response = await fetch(`/api/projects/${projectId}/pages/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          context: {
            elements: elements.map(el => ({ id: el.id, type: el.type, content: el.content })),
            theme: theme,
            elementCount: elements.length,
          },
          conversationHistory: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Handle different response types
      if (data.question) {
        // AI is asking for clarification
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.question,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data.theme) {
        // AI generated a theme
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message || `I've created a new "${data.theme.name}" theme. Would you like me to apply it?`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success(`Theme "${data.theme.name}" created!`);
      } else if (data.customComponent) {
        // AI generated a custom component
        addElement(data.customComponent);
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message || 'I've added your custom component to the page.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success('Custom component added!');
      } else if (data.elements && data.elements.length > 0) {
        // AI generated standard components
        data.elements.forEach((element: any) => {
          addElement(element);
        });
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message || `I've added ${data.elements.length} component(s) to your page.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success(`Added ${data.elements.length} component(s)`);
      } else if (data.action === 'remove') {
        // AI is removing components
        const elementsToRemove = data.elementIds || [];
        elementsToRemove.forEach((id: string) => {
          deleteElement(id);
        });
        const assistantMessage: Message = {
          role: 'assistant',
          content: `I've removed ${elementsToRemove.length} component(s) from your page.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success(`Removed ${elementsToRemove.length} component(s)`);
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: 'I processed your request, but no changes were made. Could you clarify what you'd like me to do?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

      // Create todos if applicable
      if (data.todos) {
        const newTodos: Todo[] = data.todos.map((task: string) => ({
          id: `todo-${Date.now()}-${Math.random()}`,
          task,
          completed: false,
        }));
        setTodos(prev => [...prev, ...newTodos]);
      }

    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error.message || 'Failed to process request');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const quickActions = [
    { label: 'Add hero section', prompt: 'Add a modern hero section with heading, subheading, and CTA button' },
    { label: 'Create pricing cards', prompt: 'Create 3 pricing cards with different tiers' },
    { label: 'Add feature grid', prompt: 'Add a feature grid with 6 features' },
    { label: 'Remove last component', prompt: 'Remove the last component from the page' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Context Info */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-950">
        <div className="text-xs text-neutral-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Components: {elements.length}</span>
            <span className="text-neutral-600">|</span>
            <span>Theme: {theme?.name || 'Default'}</span>
          </div>
          {theme && (
            <div className="flex items-center gap-1 mt-2">
              <div 
                className="w-3 h-3 rounded-full border border-neutral-700" 
                style={{ backgroundColor: theme.palette.primary }}
              />
              <div 
                className="w-3 h-3 rounded-full border border-neutral-700" 
                style={{ backgroundColor: theme.palette.secondary }}
              />
              <div 
                className="w-3 h-3 rounded-full border border-neutral-700" 
                style={{ backgroundColor: theme.palette.accent }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Todos */}
      {todos.length > 0 && (
        <div className="p-3 border-b border-neutral-800 bg-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-white">Tasks</h3>
            <span className="text-xs text-neutral-500">
              {todos.filter(t => t.completed).length}/{todos.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {todos.map(todo => (
              <div
                key={todo.id}
                className="flex items-start gap-2 p-2 rounded-md bg-neutral-950 hover:bg-neutral-900 transition-colors group"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="mt-0.5 text-neutral-500 hover:text-white"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                </button>
                <span
                  className={cn(
                    "flex-1 text-xs",
                    todo.completed ? "line-through text-neutral-600" : "text-neutral-300"
                  )}
                >
                  {todo.task}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-lg p-2.5 text-xs",
                message.role === 'user'
                  ? "bg-white text-black"
                  : "bg-neutral-900 text-neutral-200"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-[10px] opacity-50 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {message.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs shrink-0">
                U
              </div>
            )}
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <div className="bg-neutral-900 text-neutral-200 rounded-lg p-2.5">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-neutral-800 bg-black">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => setInput(action.prompt)}
              className="text-xs px-2 py-1 rounded-md bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="flex-1 min-h-[80px] max-h-[120px] bg-black border-neutral-800 text-white placeholder:text-neutral-600 resize-none text-sm"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="h-auto px-3 bg-white text-black hover:bg-neutral-200 disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-neutral-600 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
