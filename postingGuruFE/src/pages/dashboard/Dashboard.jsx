// src/pages/dashboard/Dashboard.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  FileText,
  Users,
  TrendingUp,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { dashboardAPI } from '@/services/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, trend, description, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend > 0 ? 'text-success' : 'text-destructive'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            {' '}from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

// Recent Posts Component
const RecentPosts = ({ posts }) => {
  const { t } = useLanguage();

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentPosts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('posts.noPosts')}</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {t('posts.createFirst')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.recentPosts')}</CardTitle>
        <CardDescription>
          {t('dashboard.recentPostsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {post.title || t('posts.untitled')}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {post.content.substring(0, 80)}...
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={
                    post.status === 'published' ? 'success' :
                      post.status === 'scheduled' ? 'default' :
                        post.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {t(`posts.status.${post.status}`)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(post.created_at), 'MMM dd, HH:mm')}
                  </span>
                </div>
              </div>
              <div className="flex -space-x-1">
                {post.targets?.slice(0, 3).map((target, index) => (
                  <div
                    key={index}
                    className="h-6 w-6 rounded-full border-2 border-background bg-accent flex items-center justify-center"
                  >
                    <span className="text-xs">
                      {target.socialAccount?.platform?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {post.targets?.length > 3 && (
                  <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                    <span className="text-xs">+{post.targets.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Upcoming Events Component
const UpcomingEvents = ({ events }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.upcomingEvents')}</CardTitle>
        <CardDescription>
          {t('dashboard.upcomingEventsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.event_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  {t('posts.createPost')}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('events.noUpcoming')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { t } = useLanguage();

  // Fetch dashboard data
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardAPI.getOverview(),
    select: (data) => data.data.data,
  });

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data: monthlyEvents } = useQuery({
    queryKey: ['dashboard', 'events', currentYear, currentMonth],
    queryFn: () => dashboardAPI.getMonthlyEvents(currentYear, currentMonth),
    select: (data) => data.data.data,
  });

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive mb-4">{t('errors.loadingFailed')}</p>
        <Button onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const stats = overview?.stats || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('posts.createPost')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.stats.scheduled')}
          value={stats.scheduledPosts || 0}
          icon={Clock}
          description={t('dashboard.stats.scheduledDesc')}
          color="primary"
        />
        <StatsCard
          title={t('dashboard.stats.published')}
          value={stats.publishedThisMonth || 0}
          icon={TrendingUp}
          description={t('dashboard.stats.publishedDesc')}
          color="success"
        />
        <StatsCard
          title={t('dashboard.stats.drafts')}
          value={stats.draftPosts || 0}
          icon={FileText}
          description={t('dashboard.stats.draftsDesc')}
          color="warning"
        />
        <StatsCard
          title={t('dashboard.stats.accounts')}
          value={stats.connectedAccounts || 0}
          icon={Users}
          description={t('dashboard.stats.accountsDesc')}
          color="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPosts posts={overview?.recentPosts} />
        <UpcomingEvents events={overview?.upcomingEvents || monthlyEvents} />
      </div>

      {/* Connected Accounts Overview */}
      {overview?.socialAccounts && overview.socialAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.connectedAccounts')}</CardTitle>
            <CardDescription>
              {t('dashboard.connectedAccountsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overview.socialAccounts.map((account) => (
                <div key={account.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    {account.account_avatar ? (
                      <img
                        src={account.account_avatar}
                        alt={account.account_name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {account.platform.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{account.account_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {account.platform}
                    </p>
                  </div>
                  <Badge variant={account.is_active ? 'success' : 'secondary'}>
                    {account.is_active ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;