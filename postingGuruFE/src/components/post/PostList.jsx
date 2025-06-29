// src/components/post/PostList.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Search, Calendar, Grid, List } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { postsAPI } from '@/services/posts';
import { useLanguage } from '@/contexts/LanguageContext';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const PostList = ({
                    status = null,
                    platform = null,
                    title,
                    showCreateButton = true
                  }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState(platform || 'all');
  const [filterStatus, setFilterStatus] = useState(status || 'all');
  const [deletePost, setDeletePost] = useState(null);
  const [page, setPage] = useState(1);

  // Fetch posts
  const {
    data: postsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['posts', { status: filterStatus, platform: filterPlatform, search: searchQuery, page }],
    queryFn: () => postsAPI.getPosts({
      status: filterStatus !== 'all' ? filterStatus : undefined,
      platform: filterPlatform !== 'all' ? filterPlatform : undefined,
      search: searchQuery || undefined,
      page,
      limit: 20,
    }),
    select: (data) => data.data.data,
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (id) => postsAPI.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success(t('posts.deleteSuccess'));
      setDeletePost(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.deleteFailed'));
    },
  });

  // Duplicate post mutation
  const duplicatePostMutation = useMutation({
    mutationFn: (id) => postsAPI.duplicatePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success(t('posts.duplicateSuccess'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.duplicateFailed'));
    },
  });

  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: (id) => postsAPI.publishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success(t('posts.publishSuccess'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.publishFailed'));
    },
  });

  // Cancel post mutation
  const cancelPostMutation = useMutation({
    mutationFn: (id) => postsAPI.cancelPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success(t('posts.cancelSuccess'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.cancelFailed'));
    },
  });

  const handleEdit = (post) => {
    // Open edit modal or navigate to edit page
    console.log('Edit post:', post);
  };

  const handleDuplicate = (post) => {
    duplicatePostMutation.mutate(post.id);
  };

  const handleDelete = (post) => {
    setDeletePost(post);
  };

  const handlePublish = (post) => {
    publishPostMutation.mutate(post.id);
  };

  const handleCancel = (post) => {
    cancelPostMutation.mutate(post.id);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const platforms = [
    { value: 'all', label: t('common.all') },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
  ];

  const statuses = [
    { value: 'all', label: t('common.all') },
    { value: 'draft', label: t('posts.status.draft') },
    { value: 'scheduled', label: t('posts.status.scheduled') },
    { value: 'published', label: t('posts.status.published') },
    { value: 'failed', label: t('posts.status.failed') },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            title={t('errors.loadingFailed')}
            description={error.message}
            action={{
              label: t('common.retry'),
              onClick: () => queryClient.invalidateQueries(['posts']),
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title || t('posts.title')}</h1>
          {postsData?.posts && (
            <p className="text-muted-foreground">
              {postsData.posts.length} {t('posts.postsFound')}
            </p>
          )}
        </div>

        {showCreateButton && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('posts.createPost')}
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder={t('posts.searchPlaceholder')}
                onSearch={handleSearch}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Platform Filter */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-3 w-3 mr-1" />
                    {platforms.find(p => p.value === filterPlatform)?.label}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[10rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
                    {platforms.map((platform) => (
                      <DropdownMenu.Item
                        key={platform.value}
                        className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                        onClick={() => setFilterPlatform(platform.value)}
                      >
                        {platform.label}
                        {filterPlatform === platform.value && (
                          <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
                        )}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Status Filter */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" size="sm">
                    {statuses.find(s => s.value === filterStatus)?.label}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[10rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
                    {statuses.map((status) => (
                      <DropdownMenu.Item
                        key={status.value}
                        className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                        onClick={() => setFilterStatus(status.value)}
                      >
                        {status.label}
                        {filterStatus === status.value && (
                          <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
                        )}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-20 w-full bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !postsData?.posts || postsData.posts.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title={t('posts.noPosts')}
              description={t('posts.noPostsDesc')}
              action={showCreateButton ? {
                label: t('posts.createFirst'),
                onClick: () => setShowCreateModal(true),
                icon: Plus,
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {postsData.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              compact={viewMode === 'list'}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {postsData?.pagination?.hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage(prev => prev + 1)}
            loading={isLoading}
          >
            {t('common.loadMore')}
          </Button>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletePost}
        onClose={() => setDeletePost(null)}
        onConfirm={() => deletePostMutation.mutate(deletePost.id)}
        title={t('posts.deleteConfirmTitle')}
        description={t('posts.deleteConfirmDesc')}
        confirmText={t('common.delete')}
        variant="destructive"
        loading={deletePostMutation.isPending}
      />
    </div>
  );
};

export default PostList;