// pages/posts/Scheduled.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/ui/Loading';
import { postsAPI } from '@/services/posts';
import { useLanguage } from '@/contexts/LanguageContext';

const Scheduled = () => {
  const { t } = useLanguage();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', { status: 'scheduled' }],
    queryFn: () => postsAPI.getPosts({ status: 'scheduled' }),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          {t('posts.scheduledPosts')}
        </h1>
        <p className="text-muted-foreground">
          Posts waiting to be published automatically
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('post.noScheduledPosts')}
          description="You don't have any scheduled posts yet"
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

export default Scheduled;