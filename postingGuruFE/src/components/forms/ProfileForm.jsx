// src/components/forms/ProfileForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, User, Mail, MapPin, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { userAPI } from '@/services/user';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  countryCode: z.string().length(2).optional(),
  timezone: z.string().max(50).optional(),
});

const ProfileForm = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      countryCode: user?.country_code || 'US',
      timezone: user?.timezone || 'GMT',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: (response) => {
      const updatedUser = response.data.data;
      updateUser(updatedUser);
      queryClient.invalidateQueries(['user', 'profile']);
      toast.success(t('profile.updateSuccess'));
      reset({
        firstName: updatedUser.first_name || '',
        lastName: updatedUser.last_name || '',
        countryCode: updatedUser.country_code || 'US',
        timezone: updatedUser.timezone || 'GMT',
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.updateFailed'));
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data) => {
    const formData = {
      ...data,
    };

    if (selectedFile) {
      formData.profileImage = selectedFile;
    }

    updateProfileMutation.mutate(formData);
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'IN', name: 'India' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
  ];

  const timezones = [
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
    { value: 'America/Chicago', label: 'CST (Central Standard Time)' },
    { value: 'America/Denver', label: 'MST (Mountain Standard Time)' },
    { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)' },
    { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
    { value: 'Europe/Paris', label: 'CET (Central European Time)' },
    { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
    { value: 'Asia/Karachi', label: 'PKT (Pakistan Standard Time)' },
    { value: 'Asia/Kolkata', label: 'IST (India Standard Time)' },
    { value: 'Australia/Sydney', label: 'AEST (Australian Eastern Standard Time)' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.personalInfo')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                {previewUrl || user?.profile_image ? (
                  <img
                    src={previewUrl || user.profile_image}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-3 w-3" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-medium">{t('profile.profilePicture')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('profile.profilePictureDesc')}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                {t('auth.firstName')}
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder={t('auth.firstNamePlaceholder')}
                error={errors.firstName}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                {t('auth.lastName')}
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder={t('auth.lastNamePlaceholder')}
                error={errors.lastName}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('profile.emailReadonly')}
            </p>
          </div>

          {/* Location and Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="countryCode" className="block text-sm font-medium mb-2">
                {t('profile.country')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="countryCode"
                  className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register('countryCode')}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                {t('profile.timezone')}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  id="timezone"
                  className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register('timezone')}
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={updateProfileMutation.isPending}
              disabled={!isDirty && !selectedFile}
            >
              {t('profile.saveChanges')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;