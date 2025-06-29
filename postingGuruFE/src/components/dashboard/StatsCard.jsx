// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const StatsCard = ({
                     title,
                     value,
                     change,
                     changeType = 'percentage',
                     icon: Icon,
                     color = 'primary',
                     description,
                     loading = false
                   }) => {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
    muted: 'text-muted-foreground',
  };

  const renderChange = () => {
    if (!change) return null;

    const isPositive = change > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const changeColor = isPositive ? 'text-success' : 'text-destructive';

    return (
      <div className={cn('flex items-center text-xs', changeColor)}>
        <TrendIcon className="h-3 w-3 mr-1" />
        <span>
          {Math.abs(change)}{changeType === 'percentage' ? '%' : ''}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn('h-4 w-4', colorClasses[color])} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-2">
          {description && (
            <p className="text-xs text-muted-foreground flex-1">
              {description}
            </p>
          )}
          {renderChange()}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;



