import { useEffect, useState } from 'react';
import { Post } from '../types/Post';
import { User } from '../types/User';
import { client } from '../utils/fetchClient';
import { Comment } from '../types/Comment';

export const usePosts = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');

  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');

  const handlePostClick = (post: Post) => {
    setSelectedPost(currentPost => {
      if (currentPost?.id === post.id) {
        return null;
      }

      return post;
    });
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedPost(null);
  };

  const handleDeleteComment = (commentId: number) => {
    const commentToDelete = comments.find(comment => comment.id === commentId);

    if (!commentToDelete) {
      return;
    }

    setCommentsError('');

    setComments(prev => prev.filter(comment => comment.id !== commentId));

    client.delete(`/comments/${commentId}`).catch(() => {
      setComments(prev => [...prev, commentToDelete]);
      setCommentsError('Failed to delete comment. Please try again.');
    });
  };

  const handleAddComment = (newComment: Comment) => {
    setComments(prev => [...prev, newComment]);
  };

  useEffect(() => {
    setIsPostsLoading(true);
    setPostsError('');

    client
      .get<User[]>('/users')
      .then(data => setUsers(data))
      .catch(() => setPostsError('Failed to load users'))
      .finally(() => {
        setIsPostsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setPosts([]);

      return;
    }

    setIsPostsLoading(true);
    setPostsError('');

    client
      .get<Post[]>(`/posts?userId=${selectedUser.id}`)
      .then(data => setPosts(data))
      .catch(() => setPostsError('Failed to load posts'))
      .finally(() => {
        setIsPostsLoading(false);
      });
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedPost) {
      setComments([]);

      return;
    }

    setIsCommentsLoading(true);
    setCommentsError('');

    client
      .get<Comment[]>(`/comments?postId=${selectedPost.id}`)
      .then(data => setComments(data))
      .catch(() => setCommentsError('Failed to load comments'))
      .finally(() => setIsCommentsLoading(false));
  }, [selectedPost]);

  return {
    users,
    posts,
    comments,
    selectedUser,
    selectedPost,
    isPostsLoading,
    postsError,
    isCommentsLoading,
    commentsError,
    handleSelectUser,
    handlePostClick,
    handleDeleteComment,
    handleAddComment,
  };
};
