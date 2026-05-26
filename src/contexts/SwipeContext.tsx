import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { SwipeContextValue } from '../types';

const SwipeContext = createContext<SwipeContextValue | null>(null);

export const SwipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const openItemId = useSharedValue<string | null>(null);
  const itemCloseFunctions = useRef<Map<string, () => void>>(new Map());

  const registerItem = useCallback((itemId: string, closeFn: () => void) => {
    itemCloseFunctions.current.set(itemId, closeFn);
  }, []);

  const unregisterItem = useCallback((itemId: string) => {
    itemCloseFunctions.current.delete(itemId);
  }, []);

  const closeAll = useCallback(() => {
    itemCloseFunctions.current.forEach((closeFn) => {
      closeFn();
    });
    openItemId.value = null;
  }, [openItemId]);

  const closeItem = useCallback((itemId: string) => {
    const closeFn = itemCloseFunctions.current.get(itemId);
    if (closeFn) {
      closeFn();
    }
    if (openItemId.value === itemId) {
      openItemId.value = null;
    }
  }, [openItemId]);

  const value: SwipeContextValue = {
    openItemId,
    closeAll,
    closeItem,
    registerItem,
    unregisterItem,
  };

  return <SwipeContext.Provider value={value}>{children}</SwipeContext.Provider>;
};

export const useSwipeContext = (): SwipeContextValue => {
  const context = useContext(SwipeContext);
  if (!context) {
    throw new Error('useSwipeContext must be used within a SwipeProvider');
  }
  return context;
};

export const useOptionalSwipeContext = (): SwipeContextValue | null => {
  return useContext(SwipeContext);
};
