// src/components/dashboard/RecentPosts.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, truncateText } from '@/utils/helpers';
import PlatformIcon from '@/components/social/PlatformIcon';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';

const RecentPosts = ({ posts, loading = false }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentPosts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-3 rounded-lg">
                <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentPosts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title={t('posts.noPosts')}
            description={t('dashboard.noRecentPosts')}
            action={{
              label: t('posts.createFirst'),
              onClick: () => {},
              icon: FileText,
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('dashboard.recentPosts')}</CardTitle>
        <Link to="/posts">
          <Button variant="ghost" size="sm">
            {t('common.viewAll')}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium truncate">
                      {post.title || t('posts.untitled')}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {truncateText(post.content, 100)}
                    </p>
                  </div>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="min-w-[8rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
                        <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                          <Link to={`/posts/${post.id}`} className="flex items-center w-full">
                            {t('common.view')}
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm">
                          {t('common.edit')}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={post.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.scheduled_at || post.created_at, { relative: true })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {post.targets?.slice(0, 3).map((target, index) => (
                      <div key={index} className="relative">
                        <PlatformIcon
                          platform={target.socialAccount?.platform}
                          size="sm"
                          className="h-5 w-5"
                        />
                      </div>
                    ))}
                    {post.targets?.length > 3 && (
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">+{post.targets.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPosts;
