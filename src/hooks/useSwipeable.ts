import { useCallback, useRef } from 'react';
import type { SwipeableRef } from '../types';

export const useSwipeable = () => {
  const ref = useRef<SwipeableRef>(null);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  const openLeft = useCallback(() => {
    ref.current?.openLeft();
  }, []);

  const openRight = useCallback(() => {
    ref.current?.openRight();
  }, []);

  const isOpen = useCallback(() => {
    return ref.current?.isOpen() ?? false;
  }, []);

  return {
    ref,
    close,
    openLeft,
    openRight,
    isOpen,
  };
};

export default useSwipeable;
