// src/components/post/AIGenerator.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  RefreshCw,
  Copy,
  Check,
  Wand2,
  Lightbulb,
  Target
} from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { aiAPI } from '@/services/ai';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

const aiSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(500, 'Prompt too long'),
  platform: z.enum(['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube']).optional(),
  postType: z.enum(['text', 'image', 'video', 'carousel', 'reel', 'short']).optional(),
  style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract']).optional(),
  size: z.enum(['512x512', '1024x1024', '1024x1792', '1792x1024']).optional(),
});

const AIGenerator = ({ onGenerate, selectedPlatforms = [] }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('text');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      platform: selectedPlatforms[0] || 'facebook',
      postType: 'text',
      style: 'realistic',
      size: '1024x1024',
    },
  });

  // Get AI usage stats
  const { data: usage } = useQuery({
    queryKey: ['ai', 'usage'],
    queryFn: () => aiAPI.getUsage(),
    select: (data) => data.data.data,
  });

  // Text generation mutation
  const generateTextMutation = useMutation({
    mutationFn: (data) => aiAPI.generateText(data),
    onSuccess: (response) => {
      const content = response.data.data.content;
      setGeneratedContent({ type: 'text', content });
      toast.success(t('ai.generateSuccess'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('ai.generateError'));
    },
  });

  // Image generation mutation
  const generateImageMutation = useMutation({
    mutationFn: (data) => aiAPI.generateImage(data),
    onSuccess: (response) => {
      const imageUrl = response.data.data.imageUrl;
      setGeneratedContent({ type: 'image', content: imageUrl });
      toast.success(t('ai.generateSuccess'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('ai.generateError'));
    },
  });

  const onSubmit = (data) => {
    if (activeTab === 'text') {
      generateTextMutation.mutate({
        prompt: data.prompt,
        platform: data.platform,
        postType: data.postType,
      });
    } else {
      generateImageMutation.mutate({
        prompt: data.prompt,
        style: data.style,
        size: data.size,
      });
    }
  };

  const handleCopy = async () => {
    if (generatedContent?.content) {
      await navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('common.copied'));
    }
  };

  const handleUseContent = () => {
    if (generatedContent?.content) {
      onGenerate?.(generatedContent.content);
    }
  };

  const promptSuggestions = {
    facebook: [
      'Create an engaging post about our new product launch',
      'Write a motivational Monday post for our community',
      'Share tips for working from home effectively',
    ],
    instagram: [
      'Create a trendy caption for a lifestyle photo',
      'Write an inspiring quote for our Instagram story',
      'Share behind-the-scenes content about our team',
    ],
    linkedin: [
      'Write a professional post about industry trends',
      'Share insights about career development',
      'Create thought leadership content about innovation',
    ],
    tiktok: [
      'Create a catchy caption for a viral dance video',
      'Write trending content about daily life hacks',
      'Share quick tips in an entertaining way',
    ],
    youtube: [
      'Write an engaging video description about tutorials',
      'Create content for a product review video',
      'Share educational content about our industry',
    ],
  };

  const currentPlatform = watch('platform');
  const suggestions = promptSuggestions[currentPlatform] || promptSuggestions.facebook;

  return (
    <div className="space-y-6">
      {/* Usage Stats */}
      {usage && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">{t('ai.usage')}</h3>
                <p className="text-xs text-muted-foreground">
                  {usage.used} / {usage.limit} {t('ai.generationsUsed')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{usage.remaining} {t('ai.remaining')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('ai.resetsOn')} {new Date(usage.resetDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-2 w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(usage.used / usage.limit) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Generator Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
          <Tabs.Trigger
            value="text"
            className="flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Type className="h-4 w-4 mr-2" />
            {t('ai.generateText')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="image"
            className="flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {t('ai.generateImage')}
          </Tabs.Trigger>
        </Tabs.List>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Text Generation Tab */}
          <Tabs.Content value="text" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('ai.platform')} ({t('common.optional')})
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                {...register('platform')}
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('posts.type')} ({t('common.optional')})
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                {...register('postType')}
              >
                <option value="text">{t('posts.types.text')}</option>
                <option value="image">{t('posts.types.image')}</option>
                <option value="video">{t('posts.types.video')}</option>
                <option value="carousel">{t('posts.types.carousel')}</option>
                <option value="reel">{t('posts.types.reel')}</option>
                <option value="short">{t('posts.types.short')}</option>
              </select>
            </div>
          </Tabs.Content>

          {/* Image Generation Tab */}
          <Tabs.Content value="image" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('ai.style')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['realistic', 'artistic', 'cartoon', 'abstract'].map((style) => (
                  <label key={style} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={style}
                      {...register('style')}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{t(`ai.styles.${style}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('ai.size')}
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                {...register('size')}
              >
                <option value="512x512">512x512 (Square)</option>
                <option value="1024x1024">1024x1024 (Square)</option>
                <option value="1024x1792">1024x1792 (Portrait)</option>
                <option value="1792x1024">1792x1024 (Landscape)</option>
              </select>
            </div>
          </Tabs.Content>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('ai.prompt')} *
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
              placeholder={t('ai.promptPlaceholder')}
              {...register('prompt')}
            />
            {errors.prompt && (
              <p className="text-sm text-destructive mt-1">{errors.prompt.message}</p>
            )}
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                {watch('prompt')?.length || 0} / 500
              </p>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div>
            <div className="flex items-center mb-2">
              <Lightbulb className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">{t('ai.suggestions')}</span>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setValue('prompt', suggestion)}
                  className="w-full text-left p-2 text-xs bg-muted hover:bg-accent rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            className="w-full"
            loading={generateTextMutation.isPending || generateImageMutation.isPending}
            disabled={!usage || usage.remaining <= 0}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {activeTab === 'text' ? t('ai.generateText') : t('ai.generateImage')}
          </Button>

          {usage && usage.remaining <= 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive text-center">
                {t('ai.limitReached')}
              </p>
            </div>
          )}
        </form>
      </Tabs.Root>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                {t('ai.generatedContent')}
              </span>
              <Badge variant="success">
                {generatedContent.type === 'text' ? t('ai.text') : t('ai.image')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedContent.type === 'text' ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{generatedContent.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? t('common.copied') : t('common.copy')}
                  </Button>
                  <Button size="sm" onClick={handleUseContent}>
                    {t('ai.useContent')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSubmit(onSubmit)()}
                    loading={generateTextMutation.isPending}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t('ai.regenerate')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={generatedContent.content}
                    alt="Generated"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUseContent}>
                    {t('ai.useImage')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generatedContent.content, '_blank')}
                  >
                    {t('common.download')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSubmit(onSubmit)()}
                    loading={generateImageMutation.isPending}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t('ai.regenerate')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {t('ai.tips')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
              <p>{t('ai.tip1')}</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
              <p>{t('ai.tip2')}</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
              <p>{t('ai.tip3')}</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
              <p>{t('ai.tip4')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGenerator;