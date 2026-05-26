export const SWIPE_DEFAULTS = {
  THRESHOLD: 0.25,
  ANIMATION_DURATION: 250,
  ACTION_WIDTH: 80,
  OVERSCROLL_FRICTION: 0.35,
  VELOCITY_THRESHOLD: 400,
  MAX_OVERSCROLL: 15,
  MAX_ACTIONS: 2,
  // WhatsApp-like smooth spring
  SPRING_DAMPING: 22,
  SPRING_STIFFNESS: 120,
  SPRING_MASS: 1,
  // Resistance when dragging
  DRAG_RESISTANCE: 0.85,
  // Velocity decay for smoother feel
  VELOCITY_DECAY: 0.8,
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
