"use client";

import React, { useState, useEffect } from 'react';
import { usePageBuilder } from './page-builder-context';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { MessageSquare, Send, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  elementId: string | null;
  content: string;
  resolved: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; image: string | null };
  threads: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string | null; email: string | null; image: string | null };
  }>;
}

export function CommentsPanel({ pageId }: { pageId: string }) {
  const { selectedElement } = usePageBuilder();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!pageId) return;
    
    fetch(`/api/pages/${pageId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
      })
      .catch(() => {});
  }, [pageId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !pageId) return;

    try {
      const response = await fetch(`/api/pages/${pageId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementId: selectedElement?.id || null,
          content: newComment,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const comment = await response.json();
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(`/api/pages/${pageId}/comments/${commentId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText }),
      });

      if (!response.ok) throw new Error('Failed to add reply');
      
      const thread = await response.json();
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, threads: [...c.threads, thread] }
          : c
      ));
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply added');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleResolve = async (commentId: string, resolved: boolean) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, resolved }),
      });

      if (!response.ok) throw new Error('Failed to update comment');
      
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, resolved } : c
      ));
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const filteredComments = selectedElement
    ? comments.filter(c => c.elementId === selectedElement.id)
    : comments;

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">Comments</h2>
            <p className="text-xs text-[#737373] mt-1">
              {selectedElement ? `Comments on ${selectedElement.type}` : 'All comments'}
            </p>
          </div>
          <Badge>{filteredComments.length}</Badge>
        </div>
      </div>

      <div className="p-4 border-b border-[#262626] shrink-0 space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="bg-[#171717] border-[#262626] text-[#e5e5e5]"
        />
        <Button
          size="sm"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Add Comment
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-[#737373]">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "p-3 rounded-lg border",
                  comment.resolved
                    ? "border-[#262626] bg-[#171717] opacity-60"
                    : "border-[#262626] bg-[#171717]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {comment.user.image && (
                      <img
                        src={comment.user.image}
                        alt={comment.user.name || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-[#fafafa]">
                        {comment.user.name || comment.user.email || 'Anonymous'}
                      </div>
                      <div className="text-xs text-[#737373]">
                        {format(new Date(comment.createdAt), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleResolve(comment.id, !comment.resolved)}
                    className="h-6 w-6"
                  >
                    {comment.resolved ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-[#e5e5e5] mb-2">{comment.content}</p>
                
                {comment.threads.length > 0 && (
                  <div className="ml-4 space-y-2 mt-2 border-l border-[#262626] pl-3">
                    {comment.threads.map((thread) => (
                      <div key={thread.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[#fafafa]">
                            {thread.user.name || thread.user.email || 'Anonymous'}
                          </span>
                          <span className="text-xs text-[#737373]">
                            {format(new Date(thread.createdAt), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <p className="text-[#a3a3a3]">{thread.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {replyingTo === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyingTo(comment.id)}
                    className="mt-2 text-xs"
                  >
                    Reply
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
