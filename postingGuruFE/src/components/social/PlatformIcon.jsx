// components/social/PlatformIcon.jsx
import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const PlatformIcon = ({ platform, size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const platformConfig = {
    facebook: { Icon: Facebook, color: 'text-blue-600' },
    instagram: { Icon: Instagram, color: 'text-pink-600' },
    twitter: { Icon: Twitter, color: 'text-blue-500' },
    linkedin: { Icon: Linkedin, color: 'text-blue-700' },
    youtube: { Icon: Youtube, color: 'text-red-600' },
    tiktok: { Icon: () => <div className="font-bold text-xs">T</div>, color: 'text-black' },
  };

  const config = platformConfig[platform?.toLowerCase()] || platformConfig.facebook;
  const { Icon, color } = config;

  return (
    <Icon
      className={`${sizeClasses[size]} ${color} ${className}`}
    />
  );
};

export default PlatformIcon;