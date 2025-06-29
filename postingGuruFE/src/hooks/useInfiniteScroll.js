
// src/hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll(hasMore, loadMore, threshold = 100) {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - threshold) {
      if (hasMore && !isFetching) {
        setIsFetching(true);
      }
    }
  }, [hasMore, isFetching, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;

    const fetchData = async () => {
      await loadMore();
      setIsFetching(false);
    };

    fetchData();
  }, [isFetching, loadMore]);

  return [isFetching, setIsFetching];
}