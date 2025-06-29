// src/components/ui/Avatar.jsx
import React    from 'react';
import { User } from 'lucide-react';
import { cn }   from '@/utils/cn';

const Avatar = React.forwardRef(({
                                   className,
                                   src,
                                   alt,
                                   fallback,
                                   size = 'default',
                                   ...props
                                 }, ref) => {
  const sizes = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      ref={ ref }
      className={ cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizes[size],
        className
      ) }
      { ...props }
    >
      { src && !imageError ? (
        <img
          src={ src }
          alt={ alt }
          onError={ handleImageError }
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-accent text-accent-foreground">
          { fallback ? (
            <span className="text-sm font-medium">
              { fallback }
            </span>
          ) : (
            <User className="h-1/2 w-1/2"/>
          ) }
        </div>
      ) }
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;

