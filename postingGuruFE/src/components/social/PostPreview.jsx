// components/posts/PostPreview.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PlatformIcon from '@/components/social/PlatformIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

const PostPreview = ({
                       post,
                       selectedPlatforms = [],
                       isVisible = true,
                       onToggleVisibility,
                       className = ''
                     }) => {
  const { t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState(selectedPlatforms[0] || 'facebook');
  const [deviceView, setDeviceView] = useState('mobile');

  if (!isVisible) {
    return (
      <Card className={`${className} opacity-50`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Preview hidden</p>
            <Button onClick={onToggleVisibility} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Show Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const deviceStyles = {
    mobile: 'max-w-sm mx-auto',
    tablet: 'max-w-md mx-auto',
    desktop: 'max-w-2xl mx-auto'
  };

  const deviceIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('post.preview')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={onToggleVisibility} variant="outline" size="sm">
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Platform Selector */}
        {selectedPlatforms.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {selectedPlatforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  selectedPlatform === platform
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <PlatformIcon platform={platform} size="sm" />
                <span className="capitalize">{platform}</span>
              </button>
            ))}
          </div>
        )}

        {/* Device View Selector */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {Object.entries(deviceIcons).map(([device, Icon]) => (
            <button
              key={device}
              onClick={() => setDeviceView(device)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                deviceView === device
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="capitalize">{device}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className={`${deviceStyles[deviceView]} transition-all duration-300`}>
          {selectedPlatform === 'facebook' && (
            <FacebookPreview post={post} deviceView={deviceView} />
          )}
          {selectedPlatform === 'instagram' && (
            <InstagramPreview post={post} deviceView={deviceView} />
          )}
          {selectedPlatform === 'twitter' && (
            <TwitterPreview post={post} deviceView={deviceView} />
          )}
          {selectedPlatform === 'linkedin' && (
            <LinkedInPreview post={post} deviceView={deviceView} />
          )}
          {selectedPlatform === 'tiktok' && (
            <TikTokPreview post={post} deviceView={deviceView} />
          )}
          {selectedPlatform === 'youtube' && (
            <YouTubePreview post={post} deviceView={deviceView} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Facebook Preview Component
const FacebookPreview = ({ post, deviceView }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">FB</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Your Page Name</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.scheduled_for ? format(new Date(post.scheduled_for), 'MMM d \'at\' h:mm a') : 'Now'}</span>
              <span>•</span>
              <span>🌍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="relative">
          {post.media.length === 1 ? (
            <img
              src={post.media[0].url || URL.createObjectURL(post.media[0])}
              alt="Post media"
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.media.slice(0, 4).map((media, index) => (
                <div key={index} className="relative">
                  <img
                    src={media.url || URL.createObjectURL(media)}
                    alt={`Media ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  {post.media.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold">+{post.media.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">👍 Like</span>
            <span className="flex items-center gap-1">💬 Comment</span>
            <span className="flex items-center gap-1">↗️ Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Instagram Preview Component
const InstagramPreview = ({ post, deviceView }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">IG</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">your_username</h4>
          </div>
          <button className="text-lg">⋯</button>
        </div>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="aspect-square bg-gray-100">
          <img
            src={post.media[0].url || URL.createObjectURL(post.media[0])}
            alt="Instagram post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <span className="text-xl">🤍</span>
            <span className="text-xl">💬</span>
            <span className="text-xl">📤</span>
          </div>
          <span className="text-xl">🔖</span>
        </div>

        {/* Content */}
        <div className="text-sm">
          <span className="font-semibold">your_username</span>{' '}
          <span className="whitespace-pre-line">{post.content}</span>
        </div>

        {/* Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-2 text-sm text-blue-600">
            {post.tags.map((tag, index) => (
              <span key={index}>#{tag} </span>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2">
          {post.scheduled_for ? format(new Date(post.scheduled_for), 'MMM d, yyyy') : 'Now'}
        </div>
      </div>
    </div>
  );
};

// Twitter Preview Component
const TwitterPreview = ({ post, deviceView }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">TW</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm">Your Name</h4>
            <span className="text-muted-foreground text-sm">@yourhandle</span>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-muted-foreground text-sm">
              {post.scheduled_for ? format(new Date(post.scheduled_for), 'MMM d') : 'now'}
            </span>
          </div>

          {/* Content */}
          <div className="mt-2 text-sm leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border">
              {post.media.length === 1 ? (
                <img
                  src={post.media[0].url || URL.createObjectURL(post.media[0])}
                  alt="Tweet media"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {post.media.slice(0, 4).map((media, index) => (
                    <img
                      key={index}
                      src={media.url || URL.createObjectURL(media)}
                      alt={`Media ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 text-muted-foreground max-w-md">
            <span className="flex items-center gap-1 text-sm">💬 Reply</span>
            <span className="flex items-center gap-1 text-sm">🔄 Retweet</span>
            <span className="flex items-center gap-1 text-sm">🤍 Like</span>
            <span className="flex items-center gap-1 text-sm">📤 Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// LinkedIn Preview Component
const LinkedInPreview = ({ post, deviceView }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">LI</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Your Name</h4>
            <p className="text-sm text-muted-foreground">Your Title • Your Company</p>
            <p className="text-xs text-muted-foreground">
              {post.scheduled_for ? format(new Date(post.scheduled_for), 'MMM d, yyyy') : 'Now'} • 🌍
            </p>
          </div>
          <button className="text-muted-foreground">⋯</button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="border-t border-b">
          <img
            src={post.media[0].url || URL.createObjectURL(post.media[0])}
            alt="LinkedIn post media"
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">👍 Like</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">💬 Comment</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">↗️ Share</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">📤 Send</span>
        </div>
      </div>
    </div>
  );
};

// TikTok Preview Component
const TikTokPreview = ({ post, deviceView }) => {
  return (
    <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
      {/* Video Area */}
      <div className="relative h-full">
        {post.media && post.media.length > 0 ? (
          <img
            src={post.media[0].url || URL.createObjectURL(post.media[0])}
            alt="TikTok video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-white text-4xl">🎵</span>
          </div>
        )}

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white">
            <h4 className="font-semibold mb-2">@yourusername</h4>
            <p className="text-sm leading-relaxed">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-sm text-blue-300">#{tag} </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Actions */}
        <div className="absolute right-3 bottom-20 flex flex-col gap-4">
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-1">
              ❤️
            </div>
            <span className="text-xs">0</span>
          </div>
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-1">
              💬
            </div>
            <span className="text-xs">0</span>
          </div>
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-1">
              ↗️
            </div>
            <span className="text-xs">Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// YouTube Preview Component
const YouTubePreview = ({ post, deviceView }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      {/* Video Thumbnail */}
      <div className="relative bg-black aspect-video">
        {post.media && post.media.length > 0 ? (
          <img
            src={post.media[0].url || URL.createObjectURL(post.media[0])}
            alt="YouTube video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-6xl">▶️</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
          0:00
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">YT</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">
              {post.content.split('\n')[0] || 'Your Video Title'}
            </h3>
            <div className="text-xs text-muted-foreground">
              <p>Your Channel Name • 0 views • {post.scheduled_for ? format(new Date(post.scheduled_for), 'MMM d, yyyy') : 'Now'}</p>
            </div>
            {post.content.split('\n').length > 1 && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {post.content.split('\n').slice(1).join('\n')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;