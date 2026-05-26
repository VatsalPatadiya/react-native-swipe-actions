import React, { useCallback, useEffect, useImperativeHandle, forwardRef, memo } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
} from 'react-native-reanimated';
import type { SwipeableItemProps, SwipeableRef, SwipeAction } from '../types';
import { SWIPE_DEFAULTS, GESTURE_CONFIG } from '../constants';
import { useOptionalSwipeContext } from '../contexts/SwipeContext';
import { SwipeActions } from './SwipeActions';
import { triggerHaptic } from '../utils';

const IS_RTL = I18nManager.isRTL;

interface SwipeableItemInternalProps extends SwipeableItemProps {
  itemUniqueId: string;
}

export const SwipeableItem = memo(forwardRef<SwipeableRef, SwipeableItemInternalProps>((
  {
    item,
    index,
    renderItem,
    leftActions,
    rightActions,
    disableLeftSwipe = false,
    disableRightSwipe = false,
    swipeThreshold = SWIPE_DEFAULTS.THRESHOLD,
    onSwipeOpen,
    onSwipeClose,
    onSwipeStart,
    onSwipeEnd,
    closeOnPress = true,
    style,
    itemUniqueId,
    enableHaptic = true,
    hapticType = 'medium',
  },
  ref
) => {
  const swipeContext = useOptionalSwipeContext();
  
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);
  const isActive = useSharedValue(false);
  const isOpen = useSharedValue(false);
  const direction = useSharedValue<'left' | 'right' | null>(null);
  
  const clampedLeftActions = leftActions?.slice(0, SWIPE_DEFAULTS.MAX_ACTIONS);
  const clampedRightActions = rightActions?.slice(0, SWIPE_DEFAULTS.MAX_ACTIONS);

  const leftWidth = (clampedLeftActions?.length || 0) * SWIPE_DEFAULTS.ACTION_WIDTH;
  const rightWidth = (clampedRightActions?.length || 0) * SWIPE_DEFAULTS.ACTION_WIDTH;
  
  const effectiveDisableLeft = IS_RTL ? disableRightSwipe : disableLeftSwipe;
  const effectiveDisableRight = IS_RTL ? disableLeftSwipe : disableRightSwipe;
  
  const effectiveLeftActions = IS_RTL ? clampedRightActions : clampedLeftActions;
  const effectiveRightActions = IS_RTL ? clampedLeftActions : clampedRightActions;

  const triggerSwipeHaptic = useCallback(() => {
    if (enableHaptic) {
      triggerHaptic(hapticType);
    }
  }, [enableHaptic, hapticType]);

  const close = useCallback(() => {
    translateX.value = withSpring(0, {
      damping: SWIPE_DEFAULTS.SPRING_DAMPING,
      stiffness: SWIPE_DEFAULTS.SPRING_STIFFNESS,
      mass: SWIPE_DEFAULTS.SPRING_MASS,
    }, () => {
      isOpen.value = false;
      direction.value = null;
    });
  }, [translateX, isOpen, direction]);

  const openLeft = useCallback(() => {
    if (effectiveDisableLeft || !effectiveLeftActions?.length) return;
    const targetX = leftWidth;
    runOnJS(triggerSwipeHaptic)();
    translateX.value = withSpring(targetX, {
      damping: SWIPE_DEFAULTS.SPRING_DAMPING,
      stiffness: SWIPE_DEFAULTS.SPRING_STIFFNESS,
      mass: SWIPE_DEFAULTS.SPRING_MASS,
    }, () => {
      isOpen.value = true;
      direction.value = 'left';
    });
  }, [translateX, leftWidth, isOpen, direction, effectiveDisableLeft, effectiveLeftActions, triggerSwipeHaptic]);

  const openRight = useCallback(() => {
    if (effectiveDisableRight || !effectiveRightActions?.length) return;
    const targetX = -rightWidth;
    runOnJS(triggerSwipeHaptic)();
    translateX.value = withSpring(targetX, {
      damping: SWIPE_DEFAULTS.SPRING_DAMPING,
      stiffness: SWIPE_DEFAULTS.SPRING_STIFFNESS,
      mass: SWIPE_DEFAULTS.SPRING_MASS,
    }, () => {
      isOpen.value = true;
      direction.value = 'right';
    });
  }, [translateX, rightWidth, isOpen, direction, effectiveDisableRight, effectiveRightActions, triggerSwipeHaptic]);

  useImperativeHandle(ref, () => ({
    close,
    openLeft,
    openRight,
    isOpen: () => isOpen.value,
  }));

  useEffect(() => {
    if (!swipeContext) return;
    swipeContext.registerItem(itemUniqueId, close);
    return () => swipeContext.unregisterItem(itemUniqueId);
  }, [swipeContext, itemUniqueId, close]);

  useAnimatedReaction(
    () => swipeContext?.openItemId?.value,
    (currentOpenId) => {
      if (currentOpenId !== null && currentOpenId !== itemUniqueId && isOpen.value) {
        runOnJS(close)();
      }
    },
    [close, itemUniqueId]
  );

  const handleSwipeStart = useCallback(() => {
    onSwipeStart?.(item);
    if (swipeContext) {
      swipeContext.openItemId.value = itemUniqueId;
    }
  }, [onSwipeStart, item, swipeContext, itemUniqueId]);

  const handleSwipeEnd = useCallback(() => {
    onSwipeEnd?.(item);
  }, [onSwipeEnd, item]);

  const handleSwipeOpen = useCallback((swipeDirection: 'left' | 'right') => {
    onSwipeOpen?.(swipeDirection, item);
  }, [onSwipeOpen, item]);

  const handleSwipeClose = useCallback(() => {
    onSwipeClose?.(item);
  }, [onSwipeClose, item]);

  const gesture = Gesture.Pan()
    .activeOffsetX(GESTURE_CONFIG.ACTIVE_OFFSET_X)
    .failOffsetY(GESTURE_CONFIG.FAIL_OFFSET_Y)
    .onBegin(() => {
      contextX.value = translateX.value;
      isActive.value = true;
      runOnJS(handleSwipeStart)();
    })
    .onUpdate((event) => {
      const rawTranslation = event.translationX * SWIPE_DEFAULTS.DRAG_RESISTANCE;
      const newX = contextX.value + rawTranslation;

      if (newX > 0 && (effectiveDisableLeft || !effectiveLeftActions?.length)) {
        // Apply rubber band effect when swiping is disabled
        translateX.value = newX * 0.15;
        return;
      }
      if (newX < 0 && (effectiveDisableRight || !effectiveRightActions?.length)) {
        translateX.value = newX * 0.15;
        return;
      }

      // WhatsApp-like overscroll with smooth resistance
      if (newX > leftWidth) {
        const overscroll = newX - leftWidth;
        const dampedOverscroll = overscroll * SWIPE_DEFAULTS.OVERSCROLL_FRICTION;
        translateX.value = leftWidth + dampedOverscroll;
      } else if (newX < -rightWidth) {
        const overscroll = Math.abs(newX) - rightWidth;
        const dampedOverscroll = overscroll * SWIPE_DEFAULTS.OVERSCROLL_FRICTION;
        translateX.value = -rightWidth - dampedOverscroll;
      } else {
        translateX.value = newX;
      }

      if (translateX.value > 0) {
        direction.value = 'left';
      } else if (translateX.value < 0) {
        direction.value = 'right';
      }
    })
    .onEnd((event) => {
      isActive.value = false;
      
      const velocityThreshold = SWIPE_DEFAULTS.VELOCITY_THRESHOLD;
      const positionThreshold = leftWidth * swipeThreshold;
      const velocity = event.velocityX;
      
      const shouldOpenLeft = !effectiveDisableLeft && effectiveLeftActions?.length && (
        (translateX.value > positionThreshold && velocity > -velocityThreshold) ||
        velocity > velocityThreshold
      );
      
      const shouldOpenRight = !effectiveDisableRight && effectiveRightActions?.length && (
        (translateX.value < -positionThreshold && velocity < velocityThreshold) ||
        velocity < -velocityThreshold
      );

      const springConfig = {
        damping: SWIPE_DEFAULTS.SPRING_DAMPING,
        stiffness: SWIPE_DEFAULTS.SPRING_STIFFNESS,
        mass: SWIPE_DEFAULTS.SPRING_MASS,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.5,
      };

      if (shouldOpenLeft) {
        runOnJS(triggerSwipeHaptic)();
        translateX.value = withSpring(leftWidth, springConfig, () => {
          isOpen.value = true;
          runOnJS(handleSwipeOpen)('left');
        });
      } else if (shouldOpenRight) {
        runOnJS(triggerSwipeHaptic)();
        translateX.value = withSpring(-rightWidth, springConfig, () => {
          isOpen.value = true;
          runOnJS(handleSwipeOpen)('right');
        });
      } else {
        translateX.value = withSpring(0, springConfig, () => {
          if (isOpen.value) {
            runOnJS(handleSwipeClose)();
          }
          isOpen.value = false;
          direction.value = null;
        });
      }
      
      runOnJS(handleSwipeEnd)();
    });

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, leftWidth * 0.5, leftWidth],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  const rightActionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-rightWidth, -rightWidth * 0.5, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  const handleContentPress = useCallback(() => {
    if (closeOnPress && isOpen.value) {
      close();
    }
  }, [close, closeOnPress, isOpen]);

  const handleActionPress = useCallback((action: SwipeAction) => {
    action.onPress(item);
    if (closeOnPress) {
      close();
    }
  }, [item, close, closeOnPress]);

  return (
    <View style={[styles.container, style]}>
      {effectiveLeftActions && effectiveLeftActions.length > 0 && (
        <Animated.View style={[styles.actionsLeft, leftActionsStyle]}>
          <SwipeActions
            actions={effectiveLeftActions}
            direction="left"
            onActionPress={handleActionPress}
          />
        </Animated.View>
      )}
      
      {effectiveRightActions && effectiveRightActions.length > 0 && (
        <Animated.View style={[styles.actionsRight, rightActionsStyle]}>
          <SwipeActions
            actions={effectiveRightActions}
            direction="right"
            onActionPress={handleActionPress}
          />
        </Animated.View>
      )}

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.content, animatedContentStyle]}>
          <View onTouchStart={handleContentPress}>
            {renderItem({ item, index })}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}));

SwipeableItem.displayName = 'SwipeableItem';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    zIndex: 2,
  },
  actionsLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  actionsRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row-reverse',
    zIndex: 1,
  },
});

export default SwipeableItem;
