// hooks/useSocialAccounts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAccountsAPI } from '@/services/socialAccounts';
import toast from 'react-hot-toast';

export function useSocialAccounts() {
  return useQuery({
    queryKey: ['social-accounts'],
    queryFn: socialAccountsAPI.getAccounts,
  });
}

export function useConnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialAccountsAPI.connectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(['social-accounts']);
      toast.success('Account connected successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to connect account');
    },
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialAccountsAPI.disconnectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(['social-accounts']);
      toast.success('Account disconnected successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disconnect account');
    },
  });
}