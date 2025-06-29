// pages/posts/History.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History as HistoryIcon } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/ui/Loading';
import { postsAPI } from '@/services/posts';
import { useLanguage } from '@/contexts/LanguageContext';

const History = () => {
  const { t } = useLanguage();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', { status: 'published' }],
    queryFn: () => postsAPI.getPosts({ status: 'published' }),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-6 w-6" />
          {t('posts.publishedPosts')}
        </h1>
        <p className="text-muted-foreground">
          All your published posts
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={t('post.noHistory')}
          description="You haven't published any posts yet"
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

export default History;