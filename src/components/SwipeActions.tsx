import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import type { SwipeAction } from '../types';
import { SWIPE_DEFAULTS } from '../constants';

interface SwipeActionsProps {
  actions: SwipeAction[];
  direction: 'left' | 'right';
  onActionPress: (action: SwipeAction) => void;
}

const IS_RTL = I18nManager.isRTL;

export const SwipeActions = memo(({ actions, direction, onActionPress }: SwipeActionsProps) => {
  const handlePress = useCallback((action: SwipeAction) => {
    onActionPress(action);
  }, [onActionPress]);

  return (
    <View style={[styles.container, direction === 'right' ? styles.rowReverse : styles.row]}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[
            styles.action,
            {
              backgroundColor: action.backgroundColor || '#FF3B30',
              width: action.width || SWIPE_DEFAULTS.ACTION_WIDTH,
            },
            action.style,
          ]}
          onPress={() => handlePress(action)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          {action.icon ? (
            action.icon
          ) : (
            <Text style={[styles.label, action.textStyle]} numberOfLines={1}>
              {action.label}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
});

SwipeActions.displayName = 'SwipeActions';

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  row: {
    flexDirection: IS_RTL ? 'row-reverse' : 'row',
  },
  rowReverse: {
    flexDirection: IS_RTL ? 'row' : 'row-reverse',
  },
  action: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SwipeActions;
