import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
}

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [commentInput, setCommentInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      await onSubmit(commentInput.trim());
      setCommentInput('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  return (
    <div className="p-4 border-t bg-background sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input 
          placeholder="Write a comment..." 
          className="flex-1" 
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <Button type="submit" size="icon" disabled={!commentInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
