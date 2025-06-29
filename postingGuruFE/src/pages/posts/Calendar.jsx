// pages/posts/Calendar.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PostCalendar from '@/components/post/PostCalendar';
import Loading from '@/components/ui/Loading';
import { postsAPI } from '@/services/posts';
import { useLanguage } from '@/contexts/LanguageContext';

const Calendar = () => {
  const { t } = useLanguage();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', { status: 'scheduled' }],
    queryFn: () => postsAPI.getPosts({ status: 'scheduled' }),
  });

  const handlePostClick = (post) => {
    // Navigate to post detail or open modal
    console.log('Post clicked:', post);
  };

  const handleEditPost = (post) => {
    // Open edit modal
    console.log('Edit post:', post);
  };

  const handleDeletePost = (postId) => {
    // Delete post
    console.log('Delete post:', postId);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <PostCalendar
        posts={posts}
        onPostClick={handlePostClick}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        loading={isLoading}
      />
    </div>
  );
};

export default Calendar;