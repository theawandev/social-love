// src/components/post/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  Calendar,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  Eye,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, truncateText } from '@/utils/helpers';
import PlatformIcon from '@/components/social/PlatformIcon';
import StatusBadge from '@/components/common/StatusBadge';

const PostCard = ({
                    post,
                    onEdit,
                    onDuplicate,
                    onDelete,
                    onPublish,
                    onCancel,
                    compact = false
                  }) => {
  const { t } = useLanguage();

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'image':
      case 'carousel':
        return ImageIcon;
      case 'video':
      case 'reel':
      case 'short':
        return Video;
      default:
        return FileText;
    }
  };

  const PostTypeIcon = getPostTypeIcon(post.post_type);

  const renderMediaPreview = () => {
    if (!post.mediaFiles || post.mediaFiles.length === 0) return null;

    const firstMedia = post.mediaFiles[0];

    return (
      <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden mb-3">
        {firstMedia.file_type.startsWith('image/') ? (
          <img
            src={firstMedia.thumbnailPath || firstMedia.file_path}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {post.mediaFiles.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            +{post.mediaFiles.length - 1}
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
        <div className="flex-shrink-0">
          <PostTypeIcon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">
            {post.title || t('posts.untitled')}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {truncateText(post.content, 60)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={post.status} />
          <span className="text-xs text-muted-foreground">
            {formatDate(post.scheduled_at || post.created_at, { relative: true })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <PostTypeIcon className="h-4 w-4 text-muted-foreground" />
            <StatusBadge status={post.status} />
            {post.is_ai_generated && (
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            )}
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
              <DropdownMenu.Content className="min-w-[10rem] bg-popover text-popover-foreground rounded-md p-1 shadow-lg border z-50">
                <DropdownMenu.Item
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                  onClick={() => onEdit?.(post)}
                >
                  <Eye className="h-3 w-3 mr-2" />
                  {t('common.view')}
                </DropdownMenu.Item>

                {post.status !== 'published' && (
                  <DropdownMenu.Item
                    className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                    onClick={() => onEdit?.(post)}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    {t('common.edit')}
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Item
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                  onClick={() => onDuplicate?.(post)}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  {t('common.duplicate')}
                </DropdownMenu.Item>

                {post.status === 'scheduled' && (
                  <>
                    <DropdownMenu.Item
                      className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                      onClick={() => onPublish?.(post)}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      {t('posts.publishNow')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                      onClick={() => onCancel?.(post)}
                    >
                      <Pause className="h-3 w-3 mr-2" />
                      {t('posts.cancel')}
                    </DropdownMenu.Item>
                  </>
                )}

                <DropdownMenu.Separator className="h-px bg-border my-1" />

                <DropdownMenu.Item
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm text-destructive"
                  onClick={() => onDelete?.(post)}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  {t('common.delete')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {renderMediaPreview()}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium line-clamp-1">
              {post.title || t('posts.untitled')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {post.targets?.slice(0, 3).map((target, index) => (
                <div key={index} className="relative">
                  <PlatformIcon
                    platform={target.socialAccount?.platform}
                    size="sm"
                    className="h-6 w-6"
                  />
                  {target.status === 'failed' && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                  )}
                </div>
              ))}
              {post.targets?.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs">+{post.targets.length - 3}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {post.scheduled_at
                  ? formatDate(post.scheduled_at, { format: 'MMM dd, HH:mm' })
                  : formatDate(post.created_at, { format: 'MMM dd, HH:mm' })
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;

