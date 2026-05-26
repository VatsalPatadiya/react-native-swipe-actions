import React, { useCallback, useEffect, useImperativeHandle, forwardRef, memo } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
} from 'react-native-reanimated';
import type { SwipeableItemProps, SwipeableRef, SwipeAction } from '../types';
import { SWIPE_DEFAULTS, GESTURE_CONFIG } from '../constants';
import { useOptionalSwipeContext } from '../contexts/SwipeContext';
import { SwipeActions } from './SwipeActions';

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
    animationDuration = SWIPE_DEFAULTS.ANIMATION_DURATION,
    onSwipeOpen,
    onSwipeClose,
    onSwipeStart,
    onSwipeEnd,
    closeOnPress = true,
    style,
    itemUniqueId,
  },
  ref
) => {
  const swipeContext = useOptionalSwipeContext();
  
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);
  const isActive = useSharedValue(false);
  const isOpen = useSharedValue(false);
  const direction = useSharedValue<'left' | 'right' | null>(null);
  
  const leftWidth = (leftActions?.length || 0) * SWIPE_DEFAULTS.ACTION_WIDTH;
  const rightWidth = (rightActions?.length || 0) * SWIPE_DEFAULTS.ACTION_WIDTH;
  
  const effectiveDisableLeft = IS_RTL ? disableRightSwipe : disableLeftSwipe;
  const effectiveDisableRight = IS_RTL ? disableLeftSwipe : disableRightSwipe;
  
  const effectiveLeftActions = IS_RTL ? rightActions : leftActions;
  const effectiveRightActions = IS_RTL ? leftActions : rightActions;

  const close = useCallback(() => {
    translateX.value = withTiming(0, { duration: animationDuration }, () => {
      isOpen.value = false;
      direction.value = null;
    });
  }, [translateX, animationDuration, isOpen, direction]);

  const openLeft = useCallback(() => {
    if (effectiveDisableLeft || !effectiveLeftActions?.length) return;
    const targetX = leftWidth;
    translateX.value = withTiming(targetX, { duration: animationDuration }, () => {
      isOpen.value = true;
      direction.value = 'left';
    });
  }, [translateX, leftWidth, animationDuration, isOpen, direction, effectiveDisableLeft, effectiveLeftActions]);

  const openRight = useCallback(() => {
    if (effectiveDisableRight || !effectiveRightActions?.length) return;
    const targetX = -rightWidth;
    translateX.value = withTiming(targetX, { duration: animationDuration }, () => {
      isOpen.value = true;
      direction.value = 'right';
    });
  }, [translateX, rightWidth, animationDuration, isOpen, direction, effectiveDisableRight, effectiveRightActions]);

  useImperativeHandle(ref, () => ({
    close,
    openLeft,
    openRight,
    isOpen: () => isOpen.value,
  }));

  useEffect(() => {
    if (swipeContext) {
      swipeContext.registerItem(itemUniqueId, close);
      return () => swipeContext.unregisterItem(itemUniqueId);
    }
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
      const newX = contextX.value + event.translationX;
      
      if (newX > 0 && (effectiveDisableLeft || !effectiveLeftActions?.length)) {
        translateX.value = 0;
        return;
      }
      if (newX < 0 && (effectiveDisableRight || !effectiveRightActions?.length)) {
        translateX.value = 0;
        return;
      }

      if (newX > leftWidth) {
        const overscroll = newX - leftWidth;
        translateX.value = leftWidth + overscroll * SWIPE_DEFAULTS.OVERSCROLL_FRICTION;
      } else if (newX < -rightWidth) {
        const overscroll = Math.abs(newX) - rightWidth;
        translateX.value = -rightWidth - overscroll * SWIPE_DEFAULTS.OVERSCROLL_FRICTION;
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

      if (shouldOpenLeft) {
        translateX.value = withSpring(leftWidth, { damping: 20, stiffness: 200 }, () => {
          isOpen.value = true;
          runOnJS(handleSwipeOpen)('left');
        });
      } else if (shouldOpenRight) {
        translateX.value = withSpring(-rightWidth, { damping: 20, stiffness: 200 }, () => {
          isOpen.value = true;
          runOnJS(handleSwipeOpen)('right');
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 }, () => {
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
