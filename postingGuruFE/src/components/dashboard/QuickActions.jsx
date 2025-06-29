// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { Plus, Calendar, Users, TrendingUp, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const QuickActions = ({ onCreatePost }) => {
  const { t } = useLanguage();

  const actions = [
    {
      icon: Plus,
      label: t('posts.createPost'),
      description: t('dashboard.createPostDesc'),
      onClick: onCreatePost,
      variant: 'default',
    },
    {
      icon: Calendar,
      label: t('navigation.calendar'),
      description: t('dashboard.viewCalendarDesc'),
      href: '/posts/calendar',
      variant: 'outline',
    },
    {
      icon: Users,
      label: t('accounts.manage'),
      description: t('dashboard.manageAccountsDesc'),
      href: '/accounts',
      variant: 'outline',
    },
    {
      icon: TrendingUp,
      label: t('analytics.view'),
      description: t('dashboard.viewAnalyticsDesc'),
      href: '/analytics',
      variant: 'outline',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;

            if (action.href) {
              return (
                <Link key={index} to={action.href}>
                  <Button
                    variant={action.variant}
                    className="w-full justify-start h-auto p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className="h-5 w-5 mt-0.5" />
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            }

            return (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
