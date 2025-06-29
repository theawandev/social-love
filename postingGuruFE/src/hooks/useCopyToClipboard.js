
// src/hooks/useCopyToClipboard.js
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState(null);

  const copy = async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Copied to clipboard!');
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      toast.error('Failed to copy');
      return false;
    }
  };

  return [copiedText, copy];
}