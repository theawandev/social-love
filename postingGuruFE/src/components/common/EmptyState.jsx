// src/components/common/EmptyState.jsx
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const EmptyState = ({
                      icon: Icon = FileText,
                      title,
                      description,
                      action,
                      className
                    }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant={action.variant || 'default'}>
          {action.icon && <action.icon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;