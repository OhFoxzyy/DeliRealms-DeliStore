"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, Send, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  timestamp: Date;
}

export function ChatPanel({ pageId }: { pageId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageId || !session?.user?.id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:3001`;
    const websocket = new WebSocket(`${wsUrl}/chat/${pageId}?userId=${session.user.id}`);

    websocket.onopen = () => {
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
          setMessages((prev) => [...prev, message]);
        } else if (message.type === 'history') {
          setMessages(message.messages || []);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      toast.error('Failed to connect to chat');
    };

    websocket.onclose = () => {
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, [pageId, session?.user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: 'message',
        content: newMessage,
        userId: session?.user?.id,
        userName: session?.user?.name || 'Anonymous',
        userImage: session?.user?.image,
      })
    );

    setNewMessage('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#6366f1]" />
            <h2 className="text-lg font-semibold text-[#fafafa]">Chat</h2>
          </div>
          {ws && ws.readyState === WebSocket.OPEN && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              Online
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className="p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-[#737373]">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs mt-2">Start a conversation with your team</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.userId === session?.user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                {message.userImage && (
                  <img
                    src={message.userImage}
                    alt={message.userName}
                    className="w-6 h-6 rounded-full shrink-0"
                  />
                )}
                <div
                  className={`flex-1 ${
                    message.userId === session?.user?.id ? 'items-end' : 'items-start'
                  } flex flex-col`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-2 rounded-lg ${
                      message.userId === session?.user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#171717] text-[#e5e5e5] border border-[#262626]'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 opacity-80">
                      {message.userName}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#262626] shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={!ws || ws.readyState !== WebSocket.OPEN}
            className="flex-1 bg-[#171717] border-[#262626] text-[#e5e5e5]"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
