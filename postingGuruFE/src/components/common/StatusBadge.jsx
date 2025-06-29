// src/components/common/StatusBadge.jsx
import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useLanguage } from '@/contexts/LanguageContext';

const StatusBadge = ({ status, className }) => {
  const { t } = useLanguage();

  const statusConfig = {
    draft: {
      variant: 'secondary',
      icon: Clock,
      label: t('posts.status.draft'),
    },
    scheduled: {
      variant: 'default',
      icon: Clock,
      label: t('posts.status.scheduled'),
    },
    published: {
      variant: 'success',
      icon: CheckCircle,
      label: t('posts.status.published'),
    },
    failed: {
      variant: 'destructive',
      icon: XCircle,
      label: t('posts.status.failed'),
    },
    partially_published: {
      variant: 'warning',
      icon: AlertCircle,
      label: t('posts.status.partially_published'),
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default StatusBadge;