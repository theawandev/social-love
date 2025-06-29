// pages/accounts/SocialAccounts.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import SocialAccountCard from '@/components/social/SocialAccountCard';
import ConnectAccountModal from '@/components/social/ConnectAccountModal';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/ui/Loading';
import { socialAccountsAPI } from '@/services/socialAccounts';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

const SocialAccounts = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Fetch social accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: socialAccountsAPI.getAccounts,
  });

  // Connect account mutation
  const connectMutation = useMutation({
    mutationFn: socialAccountsAPI.connectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(['social-accounts']);
      setShowConnectModal(false);
      toast.success(t('success.accountConnected'));
    },
    onError: (error) => {
      toast.error(error.message || t('errors.generic'));
    },
  });

  // Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: socialAccountsAPI.disconnectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(['social-accounts']);
      toast.success(t('success.accountDisconnected'));
    },
    onError: (error) => {
      toast.error(error.message || t('errors.generic'));
    },
  });

  // Refresh account mutation
  const refreshMutation = useMutation({
    mutationFn: socialAccountsAPI.refreshAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(['social-accounts']);
      toast.success('Account refreshed successfully');
    },
    onError: (error) => {
      toast.error(error.message || t('errors.generic'));
    },
  });

  const handleConnect = async (platform) => {
    // Redirect to OAuth URL
    window.location.href = `/api/auth/${platform}`;
  };

  const handleDisconnect = async (accountId) => {
    if (window.confirm(t('accounts.confirmDisconnect'))) {
      disconnectMutation.mutate(accountId);
    }
  };

  const handleRefresh = async (accountId) => {
    refreshMutation.mutate(accountId);
  };

  const connectedPlatforms = accounts.map(account => account.platform);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('accounts.socialAccounts')}</h1>
          <p className="text-muted-foreground">
            Connect your social media accounts to start scheduling posts
          </p>
        </div>
        <Button onClick={() => setShowConnectModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('accounts.connectAccount')}
        </Button>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <EmptyState
          title={t('accounts.noAccounts')}
          description={t('accounts.connectFirstAccount')}
          action={{
            label: t('accounts.connectAccount'),
            onClick: () => setShowConnectModal(true),
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              account={account}
              onDisconnect={handleDisconnect}
              onRefresh={handleRefresh}
              loading={disconnectMutation.isLoading || refreshMutation.isLoading}
            />
          ))}
        </div>
      )}

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnect}
        connectedPlatforms={connectedPlatforms}
      />
    </div>
  );
};

export default SocialAccounts;


