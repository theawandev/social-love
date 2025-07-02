import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('navigation.dashboard')}
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          {t('dashboard.welcome', 'Welcome to your social media command center!')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid cols-1 md:cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            0
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('dashboard.scheduledPosts', 'Scheduled Posts')}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            0
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('dashboard.connectedAccounts', 'Connected Accounts')}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            0
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('dashboard.postsThisMonth', 'Posts This Month')}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            5
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('dashboard.aiGenerationsLeft', 'AI Generations Left')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {t('dashboard.quickActions', 'Quick Actions')}
        </h2>
        <div className="grid cols-1 sm:cols-3 gap-4">
          <button className="p-4 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-medium">{t('posts.createPost')}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {t('dashboard.createPostDesc', 'Create and schedule a new post')}
            </div>
          </button>

          <button className="p-4 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium">{t('dashboard.connectAccount', 'Connect Account')}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {t('dashboard.connectAccountDesc', 'Link your social media accounts')}
            </div>
          </button>

          <button className="p-4 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-medium">{t('dashboard.aiGenerate', 'AI Generate')}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {t('dashboard.aiGenerateDesc', 'Create content with AI')}
            </div>
          </button>
        </div>
      </div>

      {/* User Debug Info */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('dashboard.accountInfo', 'Account Information')}
        </h2>
        <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Status:</strong> ✅ Authenticated</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;