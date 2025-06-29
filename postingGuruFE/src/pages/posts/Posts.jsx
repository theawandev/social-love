// pages/posts/Posts.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import PostCard from '@/components/posts/PostCard';
import PostForm from '@/components/forms/PostForm';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/ui/Loading';
import * as Dialog from '@radix-ui/react-dialog';
import { postsAPI } from '@/services/posts';
import { useLanguage } from '@/contexts/LanguageContext';

const Posts = () => {
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', { search: searchQuery, status: statusFilter, platform: platformFilter }],
    queryFn: () => postsAPI.getPosts({
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      platform: platformFilter !== 'all' ? platformFilter : undefined,
    }),
  });

  const handleCreatePost = async (postData) => {
    await postsAPI.createPost(postData);
    setShowCreateModal(false);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('posts.allPosts')}</h1>
          <p className="text-muted-foreground">
            Manage all your social media posts
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('post.createPost')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Platforms</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter</option>
          <option value="linkedin">LinkedIn</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
        </select>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <EmptyState
          title={t('posts.noPosts')}
          description={t('posts.createFirstPost')}
          action={{
            label: t('post.createPost'),
            onClick: () => setShowCreateModal(true),
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg z-50 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold mb-6">
                {t('post.createPost')}
              </Dialog.Title>
              <PostForm
                onSubmit={handleCreatePost}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Posts;





