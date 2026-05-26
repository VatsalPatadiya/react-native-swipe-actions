import { SWIPE_DEFAULTS } from '../constants';

interface SwipeResult {
  shouldOpen: boolean;
  direction: 'left' | 'right' | null;
  targetX: number;
}

export const computeSwipeResult = (
  translateX: number,
  velocity: number,
  leftWidth: number,
  rightWidth: number,
  threshold: number = SWIPE_DEFAULTS.THRESHOLD,
  disableLeft: boolean = false,
  disableRight: boolean = false
): SwipeResult => {
  const velocityThreshold = SWIPE_DEFAULTS.VELOCITY_THRESHOLD;
  const positionThreshold = leftWidth * threshold;

  const shouldOpenLeft = !disableLeft && leftWidth > 0 && (
    (translateX > positionThreshold && velocity > -velocityThreshold) ||
    velocity > velocityThreshold
  );

  const shouldOpenRight = !disableRight && rightWidth > 0 && (
    (translateX < -positionThreshold && velocity < velocityThreshold) ||
    velocity < -velocityThreshold
  );

  if (shouldOpenLeft) {
    return {
      shouldOpen: true,
      direction: 'left',
      targetX: leftWidth,
    };
  }

  if (shouldOpenRight) {
    return {
      shouldOpen: true,
      direction: 'right',
      targetX: -rightWidth,
    };
  }

  return {
    shouldOpen: false,
    direction: null,
    targetX: 0,
  };
};

export const isValidSwipe = (
  deltaX: number,
  deltaY: number,
  minDist: number = 10
): boolean => {
  return Math.abs(deltaX) > minDist && Math.abs(deltaX) > Math.abs(deltaY);
};
