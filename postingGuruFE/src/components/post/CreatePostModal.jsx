// src/components/post/CreatePostModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  Upload
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { useDropzone } from 'react-dropzone';
import { format, addMinutes } from 'date-fns';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { postsAPI } from '@/services/posts';
import { accountsAPI } from '@/services/accounts';
import { aiAPI } from '@/services/ai';
import { useLanguage } from '@/contexts/LanguageContext';
import PlatformIcon from '@/components/social/PlatformIcon';
import PostPreview from '@/components/social/PostPreview';
import AIGenerator from '@/components/post/AIGenerator';
import toast from 'react-hot-toast';

// Form validation schema
const postSchema = z.object({
  title: z.string().max(500, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  postType: z.enum(['text', 'image', 'video', 'carousel', 'reel', 'short']),
  scheduledAt: z.string().optional(),
  targetAccounts: z.array(z.string()).min(1, 'At least one account must be selected'),
});

const CreatePostModal = ({ isOpen, onClose, initialData = null }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('compose');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewPlatform, setPreviewPlatform] = useState('facebook');
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      postType: 'text',
      scheduledAt: '',
      targetAccounts: [],
    },
  });

  // Fetch social accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsAPI.getAccounts(),
    select: (data) => data.data.data || [],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData) => postsAPI.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['dashboard']);
      toast.success(isDraft ? t('posts.savedAsDraft') : t('posts.created'));
      onClose();
      form.reset();
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.createFailed'));
    },
  });

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv'],
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      setSelectedFiles(prev => [...prev, ...acceptedFiles]);

      // Auto-detect post type based on files
      if (acceptedFiles.length > 1) {
        form.setValue('postType', 'carousel');
      } else if (acceptedFiles[0]) {
        const fileType = acceptedFiles[0].type;
        if (fileType.startsWith('video/')) {
          form.setValue('postType', 'video');
        } else if (fileType.startsWith('image/')) {
          form.setValue('postType', 'image');
        }
      }
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    const formData = {
      ...data,
      files: selectedFiles,
      isAiGenerated: false,
    };

    if (!isDraft && !data.scheduledAt) {
      // Publish immediately
      formData.scheduledAt = null;
    }

    createPostMutation.mutate(formData);
  };

  // Handle AI content generation
  const handleAIContent = (generatedContent) => {
    form.setValue('content', generatedContent);
    setActiveTab('compose');
  };

  // Platform filtering based on post type
  const getCompatibleAccounts = () => {
    const postType = form.watch('postType');
    return accounts.filter(account => {
      const platformPostTypes = {
        facebook: ['text', 'image', 'video', 'carousel'],
        instagram: ['text', 'image', 'video', 'reel', 'carousel'],
        linkedin: ['text', 'image', 'video', 'carousel'],
        tiktok: ['video', 'short'],
        youtube: ['video', 'short'],
      };
      return platformPostTypes[account.platform]?.includes(postType);
    });
  };

  const compatibleAccounts = getCompatibleAccounts();

  // Auto-select compatible accounts when post type changes
  useEffect(() => {
    const currentSelected = form.watch('targetAccounts');
    const validAccounts = currentSelected.filter(accountId =>
      compatibleAccounts.some(acc => acc.id === accountId)
    );

    if (validAccounts.length !== currentSelected.length) {
      form.setValue('targetAccounts', validAccounts);
    }
  }, [form.watch('postType'), compatibleAccounts]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={t('posts.createPost')}
      className="max-h-[90vh] overflow-hidden"
    >
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        {/* Tab Navigation */}
        <Tabs.List className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
          <Tabs.Trigger
            value="compose"
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            {t('posts.compose')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="ai"
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t('ai.generate')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="preview"
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Image className="h-4 w-4 mr-2" />
            {t('posts.preview')}
          </Tabs.Trigger>
        </Tabs.List>

        {/* Compose Tab */}
        <Tabs.Content value="compose" className="flex-1 overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Post Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('posts.title')} ({t('common.optional')})
              </label>
              <Input
                {...form.register('title')}
                placeholder={t('posts.titlePlaceholder')}
                error={form.formState.errors.title}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Post Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('posts.content')} *
              </label>
              <textarea
                {...form.register('content')}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder={t('posts.contentPlaceholder')}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.content.message}
                </p>
              )}
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {form.watch('content')?.length || 0} / 10,000
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('ai')}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('ai.generate')}
                </Button>
              </div>
            </div>

            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('posts.type')} *
              </label>
              <select
                {...form.register('postType')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="text">{t('posts.types.text')}</option>
                <option value="image">{t('posts.types.image')}</option>
                <option value="video">{t('posts.types.video')}</option>
                <option value="carousel">{t('posts.types.carousel')}</option>
                <option value="reel">{t('posts.types.reel')}</option>
                <option value="short">{t('posts.types.short')}</option>
              </select>
            </div>

            {/* File Upload */}
            {form.watch('postType') !== 'text' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('posts.media')}
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? t('upload.dropFiles')
                      : t('upload.dragOrClick')
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('upload.supportedFormats')}
                  </p>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-accent rounded-lg">
                        <div className="flex items-center space-x-2">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-4 w-4" />
                          ) : (
                            <Video className="h-4 w-4" />
                          )}
                          <span className="text-sm truncate">{file.name}</span>
                          <Badge variant="secondary">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFiles(files => files.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Target Accounts */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('posts.targetAccounts')} *
              </label>
              {compatibleAccounts.length === 0 ? (
                <div className="text-center py-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t('posts.noCompatibleAccounts')}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    {t('accounts.addAccount')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {compatibleAccounts.map((account) => {
                    const isSelected = form.watch('targetAccounts').includes(account.id);
                    return (
                      <div
                        key={account.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                        }`}
                        onClick={() => {
                          const current = form.watch('targetAccounts');
                          if (isSelected) {
                            form.setValue('targetAccounts', current.filter(id => id !== account.id));
                          } else {
                            form.setValue('targetAccounts', [...current, account.id]);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <PlatformIcon platform={account.platform} className="h-8 w-8" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{account.account_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {account.platform}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <div className="h-2 w-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {form.formState.errors.targetAccounts && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.targetAccounts.message}
                </p>
              )}
            </div>

            {/* Scheduling */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('posts.schedule')} ({t('common.optional')})
              </label>
              <Input
                type="datetime-local"
                {...form.register('scheduledAt')}
                min={format(addMinutes(new Date(), 5), "yyyy-MM-dd'T'HH:mm")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('posts.scheduleNote')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDraft(true);
                  form.handleSubmit(onSubmit)();
                }}
                loading={createPostMutation.isPending && isDraft}
              >
                {t('posts.saveDraft')}
              </Button>

              <div className="space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={createPostMutation.isPending && !isDraft}
                  onClick={() => setIsDraft(false)}
                >
                  {form.watch('scheduledAt')
                    ? t('posts.schedule')
                    : t('posts.publishNow')
                  }
                </Button>
              </div>
            </div>
          </form>
        </Tabs.Content>

        {/* AI Generator Tab */}
        <Tabs.Content value="ai" className="flex-1">
          <AIGenerator onGenerate={handleAIContent} />
        </Tabs.Content>

        {/* Preview Tab */}
        <Tabs.Content value="preview" className="flex-1">
          <div className="space-y-4">
            {/* Platform Selector */}
            <div className="flex space-x-2">
              {['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'].map((platform) => (
                <Button
                  key={platform}
                  variant={previewPlatform === platform ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewPlatform(platform)}
                >
                  <PlatformIcon platform={platform} className="h-4 w-4 mr-1" />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Button>
              ))}
            </div>

            {/* Preview */}
            <PostPreview
              platform={previewPlatform}
              content={form.watch('content')}
              title={form.watch('title')}
              postType={form.watch('postType')}
              files={selectedFiles}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </Modal>
  );
};

export default CreatePostModal;