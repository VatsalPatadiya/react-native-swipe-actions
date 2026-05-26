import React, { useCallback, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { FlatList, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import type { SwipeListProps, SwipeableRef } from '../types';
import { SwipeProvider, useSwipeContext } from '../contexts/SwipeContext';
import { SwipeableItem } from './SwipeableItem';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface InnerSwipeListProps<T> extends SwipeListProps<T> {}

const InnerSwipeListComponent = <T extends any>(
  {
    data,
    renderItem,
    keyExtractor,
    leftActions,
    rightActions,
    disableLeftSwipe,
    disableRightSwipe,
    swipeThreshold,
    animationDuration,
    closeOnScroll = true,
    closeOnPress,
    onSwipeOpen,
    onSwipeClose,
    onSwipeStart,
    onSwipeEnd,
    ListComponent,
    listProps,
    style,
    contentContainerStyle,
    onScroll,
  }: InnerSwipeListProps<T>,
  ref: React.Ref<{ closeAll: () => void }>
) => {
  const swipeContext = useSwipeContext();
  const itemRefs = useRef<Map<string, React.RefObject<SwipeableRef>>>(new Map());
  const isScrolling = useSharedValue(false);

  const getItemRef = useCallback((itemId: string): React.RefObject<SwipeableRef> => {
    if (!itemRefs.current.has(itemId)) {
      itemRefs.current.set(itemId, React.createRef<SwipeableRef>());
    }
    return itemRefs.current.get(itemId)!;
  }, []);

  const closeAll = useCallback(() => {
    swipeContext.closeAll();
  }, [swipeContext]);

  useImperativeHandle(ref, () => ({
    closeAll,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (onScroll) {
        runOnJS(onScroll)(event);
      }
      if (closeOnScroll && !isScrolling.value) {
        runOnJS(swipeContext.closeAll)();
      }
      isScrolling.value = true;
    },
    onMomentumEnd: () => {
      isScrolling.value = false;
    },
    onEndDrag: () => {
      isScrolling.value = false;
    },
  });

  const renderSwipeableItem = useCallback(({ item, index }: { item: T; index: number }) => {
    const itemId = keyExtractor(item, index);
    const itemLeftActions = leftActions?.(item, index);
    const itemRightActions = rightActions?.(item, index);
    
    const itemDisableLeft = typeof disableLeftSwipe === 'function' 
      ? disableLeftSwipe(item, index) 
      : disableLeftSwipe;
    
    const itemDisableRight = typeof disableRightSwipe === 'function'
      ? disableRightSwipe(item, index)
      : disableRightSwipe;

    return (
      <SwipeableItem
        ref={getItemRef(itemId)}
        item={item}
        index={index}
        renderItem={renderItem}
        leftActions={itemLeftActions}
        rightActions={itemRightActions}
        disableLeftSwipe={itemDisableLeft}
        disableRightSwipe={itemDisableRight}
        swipeThreshold={swipeThreshold}
        animationDuration={animationDuration}
        onSwipeOpen={onSwipeOpen}
        onSwipeClose={onSwipeClose}
        onSwipeStart={onSwipeStart}
        onSwipeEnd={onSwipeEnd}
        closeOnPress={closeOnPress}
        itemUniqueId={itemId}
      />
    );
  }, [
    keyExtractor,
    leftActions,
    rightActions,
    disableLeftSwipe,
    disableRightSwipe,
    swipeThreshold,
    animationDuration,
    onSwipeOpen,
    onSwipeClose,
    onSwipeStart,
    onSwipeEnd,
    closeOnPress,
    renderItem,
    getItemRef,
  ]);

  const List = ListComponent || AnimatedFlatList;

  return (
    <View style={style}>
      <List
        data={data}
        renderItem={renderSwipeableItem}
        keyExtractor={keyExtractor}
        onScroll={scrollHandler}
        contentContainerStyle={contentContainerStyle}
        {...listProps}
      />
    </View>
  );
};

const InnerSwipeList = memo(forwardRef(InnerSwipeListComponent)) as <T>(
  props: InnerSwipeListProps<T> & { ref?: React.Ref<{ closeAll: () => void }> }
) => React.ReactElement;

export const SwipeListComponent = <T extends any>(
  props: SwipeListProps<T>,
  ref: React.Ref<{ closeAll: () => void }>
) => {
  return (
    <SwipeProvider>
      <InnerSwipeList {...props} ref={ref} />
    </SwipeProvider>
  );
};

export const SwipeList = memo(forwardRef(SwipeListComponent)) as <T>(
  props: SwipeListProps<T> & { ref?: React.Ref<{ closeAll: () => void }> }
) => React.ReactElement;

export default SwipeList;
