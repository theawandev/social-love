// components/forms/PostForm.jsx
import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, Image, Tag, Plus, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Validation schema
const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2200, 'Content too long'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  scheduleDate: z.string().optional(),
  scheduleTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  caption: z.string().optional(),
});

const PostForm = ({
                    post = null,
                    onSubmit,
                    onCancel,
                    loading = false,
                    socialAccounts = []
                  }) => {
  const { t } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: post?.content || '',
      platforms: post?.platforms || [],
      scheduleDate: post?.scheduled_for ? format(new Date(post.scheduled_for), 'yyyy-MM-dd') : '',
      scheduleTime: post?.scheduled_for ? format(new Date(post.scheduled_for), 'HH:mm') : '',
      tags: post?.tags || [],
      caption: post?.caption || '',
    }
  });

  const watchedPlatforms = watch('platforms');
  const watchedTags = watch('tags');
  const watchedContent = watch('content');

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = [...selectedFiles, ...acceptedFiles];
    setSelectedFiles(newFiles);

    // Generate preview URLs
    const newPreviewUrls = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const togglePlatform = (platform) => {
    const current = watchedPlatforms || [];
    const updated = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform];
    setValue('platforms', updated);
  };

  const addTag = () => {
    if (currentTag.trim() && !watchedTags?.includes(currentTag.trim())) {
      setValue('tags', [...(watchedTags || []), currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', watchedTags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Add text data
      Object.keys(data).forEach(key => {
        if (key === 'platforms' || key === 'tags') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key]) {
          formData.append(key, data[key]);
        }
      });

      // Add files
      selectedFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });

      // Combine date and time for scheduling
      if (data.scheduleDate && data.scheduleTime) {
        const scheduledFor = new Date(`${data.scheduleDate}T${data.scheduleTime}`);
        formData.append('scheduled_for', scheduledFor.toISOString());
      }

      await onSubmit(formData);
    } catch (error) {
      toast.error('Failed to save post');
      console.error('Form submission error:', error);
    }
  };

  const platformOptions = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>{t('post.content')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <div>
                <Textarea
                  {...field}
                  placeholder={t('post.contentPlaceholder')}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm ${
                    watchedContent?.length > 2200 ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {watchedContent?.length || 0} / 2200
                  </span>
                  {errors.content && (
                    <span className="text-sm text-destructive">{errors.content.message}</span>
                  )}
                </div>
              </div>
            )}
          />

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">{t('post.tags')}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {watchedTags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder={t('post.addTag')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle>{t('post.media')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? t('post.dropFiles') : t('post.dragDropFiles')}
            </p>
          </div>

          {/* File Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {previewUrls.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('post.platforms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platformOptions.map((platform) => {
              const isConnected = socialAccounts.some(acc => acc.platform === platform.id);
              const isSelected = watchedPlatforms?.includes(platform.id);

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => isConnected && togglePlatform(platform.id)}
                  disabled={!isConnected}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : isConnected
                        ? 'border-border hover:border-primary/50'
                        : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded ${platform.color} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isConnected ? t('common.connected') : t('common.notConnected')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.platforms && (
            <p className="text-sm text-destructive mt-2">{errors.platforms.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>{t('post.scheduling')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="scheduleDate"
            control={control}
            render={({ field }) => (
              <div>
                <label className="text-sm font-medium">{t('post.date')}</label>
                <div className="relative mt-1">
                  <Input
                    {...field}
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}
          />

          <Controller
            name="scheduleTime"
            control={control}
            render={({ field }) => (
              <div>
                <label className="text-sm font-medium">{t('post.time')}</label>
                <div className="relative mt-1">
                  <Input
                    {...field}
                    type="time"
                  />
                  <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={loading || !watchedPlatforms?.length}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {post ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;