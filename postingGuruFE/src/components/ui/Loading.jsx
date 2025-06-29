// src/components/ui/Loading.jsx
import React from 'react';
import { cn } from '@/utils/cn';

const Loading = ({ className, size = 'default', text }) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizes[size],
        className
      )} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

export default Loading;