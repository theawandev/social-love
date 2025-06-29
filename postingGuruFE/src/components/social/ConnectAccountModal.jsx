// components/social/ConnectAccountModal.jsx
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import PlatformIcon from './PlatformIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, ExternalLink } from 'lucide-react';

const ConnectAccountModal = ({ isOpen, onClose, onConnect, connectedPlatforms = [] }) => {
  const { t } = useLanguage();
  const [connecting, setConnecting] = useState(null);

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect your Facebook pages',
      color: 'bg-blue-600'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram business account',
      color: 'bg-pink-600'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Connect your Twitter account',
      color: 'bg-blue-500'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect your LinkedIn profile or page',
      color: 'bg-blue-700'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Connect your TikTok account',
      color: 'bg-black'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Connect your YouTube channel',
      color: 'bg-red-600'
    }
  ];

  const handleConnect = async (platformId) => {
    setConnecting(platformId);
    try {
      await onConnect(platformId);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg z-50 w-full max-w-2xl max-h-[90vh] overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-semibold">
                {t('accounts.connectAccount')}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {platforms.map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                const isConnecting = connecting === platform.id;

                return (
                  <Card key={platform.id} className={isConnected ? 'opacity-50' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                          <PlatformIcon platform={platform.id} size="md" className="text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{platform.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{platform.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnected || isConnecting}
                        className="w-full"
                        variant={isConnected ? 'secondary' : 'default'}
                      >
                        {isConnecting && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        )}
                        {isConnected ? (
                          t('accounts.connected')
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t('accounts.connect')}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConnectAccountModal;