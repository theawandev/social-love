// pages/settings/Settings.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log('Settings saved:', data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          {t('settings.general')}
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <Tabs.Root defaultValue="general" className="w-full">
        <Tabs.List className="grid w-full grid-cols-4 bg-muted rounded-lg p-1">
          <Tabs.Trigger
            value="general"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <SettingsIcon className="h-4 w-4" />
            {t('settings.general')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="notifications"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Bell className="h-4 w-4" />
            {t('settings.notifications')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="security"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            {t('settings.security')}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="billing"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CreditCard className="h-4 w-4" />
            {t('settings.billing')}
          </Tabs.Trigger>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Content value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">{t('settings.theme')}</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 ${
                      theme === 'light' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="text-sm">{t('settings.lightMode')}</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 ${
                      theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span className="text-sm">{t('settings.darkMode')}</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 ${
                      theme === 'system' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="text-sm">{t('settings.systemMode')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">{t('settings.language')}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">{t('settings.timezone')}</label>
                <select className="w-full mt-2 px-3 py-2 border rounded-lg bg-background">
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Notifications */}
        <Tabs.Content value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch.Root
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, email: checked }))
                  }
                  className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-primary relative"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications
                  </p>
                </div>
                <Switch.Root
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, push: checked }))
                  }
                  className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-primary relative"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
                </Switch.Root>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Emails</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive product updates and tips
                  </p>
                </div>
                <Switch.Root
                  checked={notifications.marketing}
                  onCheckedChange={(checked) =>
                    setNotifications(prev => ({ ...prev, marketing: checked }))
                  }
                  className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-primary relative"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
                </Switch.Root>
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Security */}
        <Tabs.Content value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.changePassword')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    {...register('currentPassword')}
                    type="password"
                    placeholder="Enter current password"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    {...register('newPassword')}
                    type="password"
                    placeholder="Enter new password"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Confirm new password"
                    className="mt-1"
                  />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Billing */}
        <Tabs.Content value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Free Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    5 posts per month, 2 social accounts
                  </p>
                </div>
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No payment method on file
              </p>
              <Button variant="outline">Add Payment Method</Button>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default Settings;