
// src/hooks/useKeyboard.js
import { useEffect } from 'react';

export function useKeyboard(key, handler, deps = []) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === key) {
        handler(event);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [key, handler, ...deps]);
}