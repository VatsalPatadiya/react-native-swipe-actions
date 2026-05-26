export const SWIPE_DEFAULTS = {
  THRESHOLD: 0.3,
  ANIMATION_DURATION: 200,
  ACTION_WIDTH: 80,
  OVERSCROLL_FRICTION: 0.5,
  VELOCITY_THRESHOLD: 500,
  MAX_OVERSCROLL: 20,
} as const;

export const SWIPE_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  BOTH: 'both',
  NONE: 'none',
} as const;

export const GESTURE_CONFIG = {
  ACTIVE_OFFSET_X: [-10, 10] as [number, number],
  FAIL_OFFSET_Y: [-5, 5] as [number, number],
  MIN_VELOCITY: 100,
  MIN_DIST: 10,
};

export const MIN_SWIPE_DISTANCE = 10;
