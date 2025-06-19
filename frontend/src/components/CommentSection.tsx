import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import { Send, Delete } from '@mui/icons-material';
import { useComments } from '../hooks/useComments';

interface CommentSectionProps {
  eventId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ eventId }) => {
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const { getCommentsForEvent, addComment, deleteComment, getCommentCount } = useComments();

  const comments = getCommentsForEvent(eventId);
  const commentCount = getCommentCount(eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(eventId, newComment, authorName || 'Anonymous');
      setNewComment('');
      setAuthorName('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comments ({commentCount})
      </Typography>

      {/* Add Comment Form */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              size="small"
              placeholder="Your name (optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              sx={{ maxWidth: 200 }}
            />
            <TextField
              multiline
              rows={3}
              placeholder="Share your thoughts about this event..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={!newComment.trim()}
                size="small"
              >
                Post Comment
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No comments yet. Be the first to share your thoughts!
        </Typography>
      ) : (
        <Stack spacing={2}>
          {comments.map((comment, index) => (
            <Box key={comment.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      {comment.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(comment.timestamp)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => deleteComment(comment.id)}
                    sx={{ color: 'error.main', opacity: 0.7, '&:hover': { opacity: 1 } }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2">
                  {comment.text}
                </Typography>
              </Paper>
              {index < comments.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default CommentSection;
