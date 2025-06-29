// pages/posts/Drafts.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileEdit, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import PostCard from '@/components/posts/PostCard';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/ui/Loading';
import { postsAPI } from '@/services/posts';
import { useLanguage } from '@/contexts/LanguageContext';

const Drafts = () => {
  const { t } = useLanguage();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', { status: 'draft' }],
    queryFn: () => postsAPI.getPosts({ status: 'draft' }),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileEdit className="h-6 w-6" />
            {t('posts.draftPosts')}
          </h1>
          <p className="text-muted-foreground">
            Posts saved as drafts
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('post.createPost')}
        </Button>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <EmptyState
          icon={FileEdit}
          title={t('post.noDrafts')}
          description="You don't have any draft posts yet"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Drafts;