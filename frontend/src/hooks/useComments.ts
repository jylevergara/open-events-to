import { useState, useEffect } from 'react';

const COMMENTS_KEY = 'toronto-events-comments';

export interface Comment {
  id: string;
  eventId: number;
  text: string;
  timestamp: string;
  author: string;
}

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  // Load comments from localStorage on mount
  useEffect(() => {
    try {
      const savedComments = localStorage.getItem(COMMENTS_KEY);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    } catch (error) {
      console.error('Error loading comments from localStorage:', error);
    }
  }, []);

  // Save comments to localStorage whenever comments change
  useEffect(() => {
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error('Error saving comments to localStorage:', error);
    }
  }, [comments]);

  const addComment = (eventId: number, text: string, author: string = 'Anonymous') => {
    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      eventId,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      author: author.trim() || 'Anonymous',
    };

    setComments(prev => [newComment, ...prev]);
    return newComment;
  };

  const getCommentsForEvent = (eventId: number): Comment[] => {
    return comments
      .filter(comment => comment.eventId === eventId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const getCommentCount = (eventId: number): number => {
    return comments.filter(comment => comment.eventId === eventId).length;
  };

  const clearAllComments = () => {
    setComments([]);
  };

  return {
    comments,
    addComment,
    getCommentsForEvent,
    deleteComment,
    getCommentCount,
    clearAllComments,
    totalComments: comments.length,
  };
};
