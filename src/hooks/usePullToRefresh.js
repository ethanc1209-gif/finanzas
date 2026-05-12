import { useState, useRef, useCallback } from "react";

export function usePullToRefresh(onRefresh) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const threshold = 70;

  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    const scrollEl = e.currentTarget;
    if (scrollEl.scrollTop > 0) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 10) setPulling(true);
  }, []);

  const onTouchEnd = useCallback(async (e) => {
    const dy = e.changedTouches[0].clientY - startY.current;
    setPulling(false);
    if (dy >= threshold) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  }, [onRefresh]);

  return { pulling, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}