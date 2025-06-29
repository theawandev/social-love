// components/social/SocialAccountCard.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { MoreHorizontal, Unlink, Settings, RefreshCw } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import PlatformIcon from './PlatformIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

const SocialAccountCard = ({
                             account,
                             onDisconnect,
                             onRefresh,
                             onSettings,
                             loading = false
                           }) => {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.(account.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              {account.account_avatar ? (
                <img
                  src={account.account_avatar}
                  alt={account.account_name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <PlatformIcon platform={account.platform} size="md" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{account.account_name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {account.platform}
              </p>
            </div>
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
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {t('accounts.refresh')}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onSettings?.(account)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  {t('accounts.settings')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onClick={() => onDisconnect?.(account.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                >
                  <Unlink className="h-4 w-4" />
                  {t('accounts.disconnect')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('accounts.status')}</span>
            <Badge variant={account.is_active ? 'success' : 'secondary'}>
              {account.is_active ? t('common.active') : t('common.inactive')}
            </Badge>
          </div>

          {account.follower_count && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('accounts.followers')}</span>
              <span className="text-sm font-medium">
                {account.follower_count.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('accounts.connected')}</span>
            <span className="text-sm">
              {format(new Date(account.created_at), 'MMM d, yyyy')}
            </span>
          </div>

          {account.last_post_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('accounts.lastPost')}</span>
              <span className="text-sm">
                {format(new Date(account.last_post_at), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialAccountCard;