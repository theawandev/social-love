// components/posts/PostCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/common/StatusBadge';
import PlatformIcon from '@/components/social/PlatformIcon';
import { MoreHorizontal, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { format } from 'date-fns';
import { truncateText } from '@/utils/formatters';

const PostCard = ({ post, onEdit, onDelete, onDuplicate, onView }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={post.status} />
            {post.scheduled_for && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(post.scheduled_for), 'MMM d, h:mm a')}
              </span>
            )}
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-background border rounded-lg shadow-lg p-1 min-w-40">
                <DropdownMenu.Item
                  onClick={() => onView?.(post)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onEdit?.(post)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onDuplicate?.(post)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onClick={() => onDelete?.(post.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-foreground">
            {truncateText(post.content, 150)}
          </p>

          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.media.slice(0, 4).map((media, index) => (
                <div key={index} className="relative">
                  <img
                    src={media.thumbnail_url || media.url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  {post.media.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center text-white text-sm font-medium">
                      +{post.media.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.platforms?.slice(0, 3).map((platform, index) => (
                <PlatformIcon key={index} platform={platform} size="sm" />
              ))}
              {post.platforms?.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.platforms.length - 3}
                </span>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {post.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{post.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;