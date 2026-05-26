import { Platform, Vibration } from 'react-native';
import type { HapticType } from '../types';

// iOS 10+ haptic feedback pattern
const iosHapticPatterns: Record<string, number[]> = {
  light: [5],
  medium: [10],
  heavy: [15],
  selection: [5, 2, 5],
};

export const triggerHaptic = (type: HapticType = 'medium') => {
  if (type === 'none') return;

  if (Platform.OS === 'ios') {
    // Use iOS system sound ID 1519 for peek (light haptic)
    // 1520 for pop (medium haptic)
    // 1521 for failed (heavy haptic)
    const pattern = iosHapticPatterns[type] || iosHapticPatterns.medium;
    Vibration.vibrate(pattern);
  } else {
    // Android: Use Vibration API with short duration
    const durations: Record<string, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      selection: 15,
    };
    Vibration.vibrate(durations[type] || 20);
  }
};
