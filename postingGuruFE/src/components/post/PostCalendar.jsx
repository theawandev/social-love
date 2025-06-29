// components/posts/PostCalendar.jsx
import React, { useState, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Calendar, Clock, Edit, Trash2, ExternalLink } from 'lucide-react';
import PlatformIcon from '@/components/social/PlatformIcon';
import StatusBadge from '@/components/common/StatusBadge';
import * as Dialog from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const PostCalendar = ({
                        posts = [],
                        onPostClick,
                        onEditPost,
                        onDeletePost,
                        loading = false
                      }) => {
  const { t } = useLanguage();
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState(null);

  // Transform posts into calendar events
  const events = useMemo(() => {
    return posts.map(post => ({
      id: post.id,
      title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
      start: new Date(post.scheduled_for),
      end: new Date(post.scheduled_for),
      resource: post,
      allDay: false,
    }));
  }, [posts]);

  const eventStyleGetter = (event) => {
    const post = event.resource;
    let backgroundColor = '#3174ad';

    switch (post.status) {
      case 'scheduled':
        backgroundColor = '#059669';
        break;
      case 'published':
        backgroundColor = '#10b981';
        break;
      case 'failed':
        backgroundColor = '#dc2626';
        break;
      case 'draft':
        backgroundColor = '#6b7280';
        break;
      default:
        backgroundColor = '#3174ad';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
      }
    };
  };

  const CustomEvent = ({ event }) => {
    const post = event.resource;
    return (
      <div className="text-xs">
        <div className="font-medium truncate">{event.title}</div>
        <div className="flex items-center gap-1 mt-1">
          {post.platforms?.slice(0, 2).map((platform, index) => (
            <PlatformIcon key={index} platform={platform} size="xs" />
          ))}
          {post.platforms?.length > 2 && (
            <span className="text-xs">+{post.platforms.length - 2}</span>
          )}
        </div>
      </div>
    );
  };

  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          {t('common.today')}
        </Button>
      </div>

      <h2 className="text-lg font-semibold">{label}</h2>

      <div className="flex items-center gap-2">
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('month')}
        >
          {t('calendar.month')}
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('week')}
        >
          {t('calendar.week')}
        </Button>
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView('day')}
        >
          {t('calendar.day')}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('calendar.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('calendar.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedPost(event.resource)}
            components={{
              event: CustomEvent,
              toolbar: CustomToolbar,
            }}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
            }}
          />
        </CardContent>
      </Card>

      {/* Post Detail Modal */}
      <Dialog.Root open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg z-50 w-full max-w-md max-h-[90vh] overflow-auto">
            {selectedPost && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{t('post.details')}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={selectedPost.status} />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(selectedPost.scheduled_for), 'PPp')}
                      </span>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="outline" size="sm">
                      ×
                    </Button>
                  </Dialog.Close>
                </div>

                <div className="space-y-4">
                  {/* Content */}
                  <div>
                    <label className="text-sm font-medium">{t('post.content')}</label>
                    <p className="mt-1 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* Platforms */}
                  <div>
                    <label className="text-sm font-medium">{t('post.platforms')}</label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedPost.platforms?.map((platform, index) => (
                        <div key={index} className="flex items-center gap-1 text-sm">
                          <PlatformIcon platform={platform} size="sm" />
                          <span className="capitalize">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Media */}
                  {selectedPost.media && selectedPost.media.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">{t('post.media')}</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {selectedPost.media.slice(0, 4).map((media, index) => (
                          <img
                            key={index}
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">{t('post.tags')}</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPost.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduling Info */}
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{t('post.scheduledFor')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(selectedPost.scheduled_for), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onEditPost?.(selectedPost);
                        setSelectedPost(null);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onPostClick?.(selectedPost);
                        setSelectedPost(null);
                      }}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('common.view')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onDeletePost?.(selectedPost.id);
                        setSelectedPost(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default PostCalendar;



