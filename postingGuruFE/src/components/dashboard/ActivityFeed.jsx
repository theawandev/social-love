// src/components/dashboard/ActivityFeed.jsx
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/helpers';
import PlatformIcon from '@/components/social/PlatformIcon';

const ActivityFeed = ({ activities, loading = false }) => {
  const { t } = useLanguage();

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'post_published':
        return status === 'success' ? CheckCircle : XCircle;
      case 'post_scheduled':
        return Clock;
      case 'account_connected':
        return CheckCircle;
      case 'account_disconnected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getActivityColor = (type, status) => {
    switch (type) {
      case 'post_published':
        return status === 'success' ? 'text-success' : 'text-destructive';
      case 'post_scheduled':
        return 'text-primary';
      case 'account_connected':
        return 'text-success';
      case 'account_disconnected':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('dashboard.noRecentActivity')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type, activity.status);
            const iconColor = getActivityColor(activity.type, activity.status);

            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 ${iconColor}`}>
                  <IconComponent className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    {activity.platform && (
                      <PlatformIcon platform={activity.platform} size="xs" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(activity.timestamp, { relative: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;