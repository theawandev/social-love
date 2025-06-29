// src/hooks/useAccounts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsAPI }                           from '@/services/accounts';
import toast                                     from 'react-hot-toast';

export function useAccounts(platform) {
  return useQuery({
    queryKey: ['accounts', platform],
    queryFn: () => accountsAPI.getAccounts(platform),
    select: (data) => data.data.data || [],
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountData) => accountsAPI.addAccount(accountData),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success('Account connected successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to connect account');
    },
  });
}

export function useRemoveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, options }) => accountsAPI.removeAccount(id, options),
    onSuccess: () => {
      queryClient.invalidateQueries(['accounts']);
      toast.success('Account disconnected successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disconnect account');
    },
  });
}




