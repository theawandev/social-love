// src/components/dashboard/UpcomingEvents.jsx
import React from 'react';
import { Calendar, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

const UpcomingEvents = ({ events, loading = false, onCreatePost }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.upcomingEvents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.upcomingEvents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title={t('events.noUpcoming')}
            description={t('dashboard.noUpcomingEvents')}
          />
        </CardContent>
      </Card>
    );
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'holiday':
        return 'success';
      case 'observance':
        return 'default';
      case 'seasonal':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('dashboard.upcomingEvents')}</CardTitle>
        <Button variant="ghost" size="sm">
          {t('common.viewAll')}
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium truncate">{event.name}</h4>
                  <Badge variant={getEventTypeColor(event.event_type)} className="text-xs">
                    {t(`events.types.${event.event_type}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(event.event_date, { format: 'MMM dd, yyyy' })}
                  {event.description && ` • ${event.description}`}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreatePost?.(event)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-3 w-3 mr-1" />
                {t('posts.create')}
              </Button>
            </div>
          ))}
        </div>

        {events.length > 5 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {t('dashboard.moreEvents', { count: events.length - 5 })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;