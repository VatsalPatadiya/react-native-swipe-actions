import { ViewStyle, TextStyle } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export type SwipeDirection = 'left' | 'right' | 'both' | 'none';

export interface SwipeAction {
  id: string;
  label: string;
  backgroundColor?: string;
  icon?: React.ReactNode;
  onPress: (item: any) => void;
  width?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'none';

export interface SwipeableItemProps<T = any> {
  item: T;
  index: number;
  renderItem: (params: { item: T; index: number }) => React.ReactElement;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  disableLeftSwipe?: boolean;
  disableRightSwipe?: boolean;
  swipeThreshold?: number;
  animationDuration?: number;
  onSwipeOpen?: (direction: 'left' | 'right', item: T) => void;
  onSwipeClose?: (item: T) => void;
  onSwipeStart?: (item: T) => void;
  onSwipeEnd?: (item: T) => void;
  closeOnPress?: boolean;
  closeOnScroll?: boolean;
  style?: ViewStyle;
  itemId?: string | number;
  enableHaptic?: boolean;
  hapticType?: HapticType;
}

export interface SwipeListProps<T = any> {
  data: T[];
  renderItem: (params: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  leftActions?: (item: T, index: number) => SwipeAction[] | undefined;
  rightActions?: (item: T, index: number) => SwipeAction[] | undefined;
  disableLeftSwipe?: boolean | ((item: T, index: number) => boolean);
  disableRightSwipe?: boolean | ((item: T, index: number) => boolean);
  swipeThreshold?: number;
  animationDuration?: number;
  closeOnScroll?: boolean;
  closeOnPress?: boolean;
  onSwipeOpen?: (direction: 'left' | 'right', item: T) => void;
  onSwipeClose?: (item: T) => void;
  onSwipeStart?: (item: T) => void;
  onSwipeEnd?: (item: T) => void;
  ListComponent?: React.ComponentType<any>;
  listProps?: any;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  onScroll?: (event: any) => void;
  simultaneousHandlers?: React.RefObject<any> | React.RefObject<any>[];
  enableHaptic?: boolean;
  hapticType?: HapticType;
}

export interface SwipeContextValue {
  openItemId: SharedValue<string | null>;
  closeAll: () => void;
  closeItem: (itemId: string) => void;
  registerItem: (itemId: string, closeFn: () => void) => void;
  unregisterItem: (itemId: string) => void;
}

export interface GestureState {
  x: SharedValue<number>;
  isActive: SharedValue<boolean>;
  direction: SharedValue<'left' | 'right' | null>;
  isOpen: SharedValue<boolean>;
}

export interface SwipeableRef {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  isOpen: () => boolean;
}
