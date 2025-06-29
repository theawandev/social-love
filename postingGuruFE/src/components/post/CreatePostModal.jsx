// src/components/post/CreatePostModal.jsx - Updated with PostPreview integration
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Image,
  Video,
  FileText,
  Sparkles,
  X,
  Plus,
  Upload,
  Eye,
  Edit,
  Send,
  Save,
  Loader2
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { useDropzone } from 'react-dropzone';
import { format, addMinutes } from 'date-fns';

import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { postsAPI } from '@/services/posts';
import { accountsAPI } from '@/services/accounts';
import { aiAPI } from '@/services/ai';
import { useLanguage } from '@/contexts/LanguageContext';
import PlatformIcon from '@/components/social/PlatformIcon';
import PostPreview from '@/components/social/PostPreview';
import { validateMultipleFiles, validatePost } from '@/utils/validators';
import toast from 'react-hot-toast';

// Form validation schema
const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  platforms: z.array(z.string()).min(1, 'At least one platform must be selected'),
  scheduledFor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  caption: z.string().max(500, 'Caption too long').optional(),
});

const CreatePostModal = ({
                           isOpen,
                           onClose,
                           initialData = null,
                           defaultPlatforms = []
                         }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('compose');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDraft, setIsDraft] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [currentTag, setCurrentTag] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: initialData?.content || '',
      platforms: initialData?.platforms || defaultPlatforms,
      scheduledFor: initialData?.scheduled_for ? format(new Date(initialData.scheduled_for), "yyyy-MM-dd'T'HH:mm") : '',
      tags: initialData?.tags || [],
      caption: initialData?.caption || '',
    },
  });

  const watchedContent = watch('content');
  const watchedPlatforms = watch('platforms');
  const watchedTags = watch('tags');
  const watchedScheduledFor = watch('scheduledFor');

  // Fetch social accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: accountsAPI.getAccounts,
  });

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    try {
      validateMultipleFiles(acceptedFiles, {
        maxFiles: 10,
        allowedTypes: ['image', 'video']
      });

      const newFiles = [...selectedFiles, ...acceptedFiles];
      setSelectedFiles(newFiles);

      // Generate preview URLs
      const newPreviewUrls = acceptedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } catch (error) {
      toast.error(error.message);
    }
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  // Remove file
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  // Platform selection
  const togglePlatform = (platform) => {
    const current = watchedPlatforms || [];
    const updated = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform];
    setValue('platforms', updated);
  };

  // Tag management
  const addTag = () => {
    if (currentTag.trim() && !watchedTags?.includes(currentTag.trim())) {
      setValue('tags', [...(watchedTags || []), currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', watchedTags?.filter(tag => tag !== tagToRemove) || []);
  };

  // AI content generation
  const generateAIContent = async (prompt) => {
    if (!prompt.trim()) return;

    setIsGeneratingAI(true);
    try {
      const response = await aiAPI.generateText({
        prompt,
        platforms: watchedPlatforms,
        maxLength: 2000
      });
      setValue('content', response.content);
      if (response.tags) {
        setValue('tags', response.tags);
      }
      toast.success('AI content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate AI content');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Create/Update post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const formData = new FormData();

      // Add text data
      formData.append('content', postData.content);
      formData.append('platforms', JSON.stringify(postData.platforms));

      if (postData.caption) formData.append('caption', postData.caption);
      if (postData.tags?.length) formData.append('tags', JSON.stringify(postData.tags));
      if (postData.scheduledFor) formData.append('scheduled_for', new Date(postData.scheduledFor).toISOString());

      formData.append('status', isDraft ? 'draft' : (postData.scheduledFor ? 'scheduled' : 'published'));

      // Add files
      selectedFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });

      if (initialData?.id) {
        return postsAPI.updatePost(initialData.id, formData);
      } else {
        return postsAPI.createPost(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success(
        isDraft
          ? t('success.draftSaved')
          : watchedScheduledFor
            ? t('success.postScheduled')
            : t('success.postPublished')
      );
      onClose();
      reset();
      setSelectedFiles([]);
      setPreviewUrls([]);
    },
    onError: (error) => {
      toast.error(error.message || t('errors.generic'));
    },
  });

  // Form submission
  const onSubmit = async (data) => {
    try {
      // Validate post data
      validatePost({
        content: data.content,
        platforms: data.platforms,
        media: selectedFiles,
        scheduledFor: data.scheduledFor
      });

      await createPostMutation.mutateAsync(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleClose = () => {
    if (watchedContent || selectedFiles.length > 0) {
      if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
        onClose();
        reset();
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    } else {
      onClose();
    }
  };

  // Platform options
  const platformOptions = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-600' },
  ];

  // Get connected platforms
  const connectedPlatforms = accounts.map(acc => acc.platform);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-xl z-50 w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex h-full max-h-[90vh]">
            {/* Left Panel - Form */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-semibold">
                    {initialData ? t('post.editPost') : t('post.createPost')}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="outline" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>

                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                  <Tabs.List className="grid w-full grid-cols-3 mb-6">
                    <Tabs.Trigger value="compose" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Compose
                    </Tabs.Trigger>
                    <Tabs.Trigger value="ai" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Assistant
                    </Tabs.Trigger>
                    <Tabs.Trigger value="schedule" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </Tabs.Trigger>
                  </Tabs.List>

                  {/* Compose Tab */}
                  <Tabs.Content value="compose" className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Content */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('post.content')}
                        </label>
                        <Controller
                          name="content"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              placeholder={t('post.contentPlaceholder')}
                              rows={6}
                              className="resize-none"
                            />
                          )}
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

                      {/* Media Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('post.media')}
                        </label>
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input {...getInputProps()} />
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isDragActive ? t('post.dropFiles') : t('post.dragDropFiles')}
                          </p>
                        </div>

                        {/* File Previews */}
                        {previewUrls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                            {previewUrls.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview.url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-20 object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Platform Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('post.platforms')}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {platformOptions.map((platform) => {
                            const isConnected = connectedPlatforms.includes(platform.id);
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
                                  <PlatformIcon platform={platform.id} size="md" />
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
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('post.tags')}
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {watchedTags?.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
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
                    </form>
                  </Tabs.Content>

                  {/* AI Assistant Tab */}
                  <Tabs.Content value="ai" className="space-y-4">
                    <div className="text-center p-8">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">AI Content Generator</h3>
                      <p className="text-muted-foreground mb-6">
                        Let AI help you create engaging content for your posts
                      </p>

                      <div className="space-y-4 max-w-md mx-auto">
                        <Input
                          placeholder="Describe what you want to post about..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              generateAIContent(e.target.value);
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Describe"]');
                            generateAIContent(input?.value || '');
                          }}
                          disabled={isGeneratingAI}
                          className="w-full"
                        >
                          {isGeneratingAI && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Generate Content
                        </Button>
                      </div>
                    </div>
                  </Tabs.Content>

                  {/* Schedule Tab */}
                  <Tabs.Content value="schedule" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Schedule Post
                      </label>
                      <Controller
                        name="scheduledFor"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="datetime-local"
                            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                          />
                        )}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to publish immediately
                      </p>
                    </div>
                  </Tabs.Content>
                </Tabs.Root>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDraft(true);
                      handleSubmit(onSubmit)();
                    }}
                    disabled={createPostMutation.isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t('post.saveDraft')}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClose}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsDraft(false);
                        handleSubmit(onSubmit)();
                      }}
                      disabled={!isValid || createPostMutation.isLoading}
                    >
                      {createPostMutation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Send className="h-4 w-4 mr-2" />
                      {watchedScheduledFor ? t('post.schedule') : t('post.publishNow')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-96 border-l bg-muted/30 overflow-auto">
              <PostPreview
                post={{
                  content: watchedContent || '',
                  media: previewUrls.map(p => ({ url: p.url })),
                  tags: watchedTags || [],
                  scheduled_for: watchedScheduledFor || new Date().toISOString()
                }}
                selectedPlatforms={watchedPlatforms || []}
                isVisible={showPreview}
                onToggleVisibility={() => setShowPreview(!showPreview)}
                className="h-full"
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreatePostModal;