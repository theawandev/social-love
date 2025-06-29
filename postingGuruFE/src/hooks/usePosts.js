// src/hooks/usePosts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '@/services/posts';
import toast from 'react-hot-toast';

export function usePosts(filters = {}) {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postsAPI.getPosts(filters),
    select: (data) => data.data.data,
  });
}

export function usePost(id) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => postsAPI.getPost(id),
    select: (data) => data.data.data,
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData) => postsAPI.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => postsAPI.updatePost(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['posts', variables.id]);
      toast.success('Post updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postsAPI.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postsAPI.publishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Post published successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    },
  });
}