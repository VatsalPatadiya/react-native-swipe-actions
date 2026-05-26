# react-native-fluid-swipe-list

High-performance, fully customizable React Native swipeable list items with native-feeling gestures and animations.

[![npm version](https://badge.fury.io/js/react-native-fluid-swipe-list.svg)](https://badge.fury.io/js/react-native-fluid-swipe-list)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📱 Preview

![Demo Animation](assets/demo.svg)

> **🎬 Full Video Demo:** [Watch on YouTube](https://youtube.com/your-video-link) *(Coming Soon)*

### Screenshots

| Left Swipe | Right Swipe | Both Swipes |
|------------|-------------|-------------|
| ![Left Swipe](assets/screenshots/left-swipe.png) | ![Right Swipe](assets/screenshots/right-swipe.png) | ![Both](assets/screenshots/both-swipes.png) |
| *Archive & Read actions* | *Delete action* | *Full interaction* |

> **Note:** Place your screenshots in `assets/screenshots/` folder and update the paths above.

## Features

- **Native-like gestures** - Smooth physics-based animations using Reanimated 3
- **High performance** - 60 FPS animations with worklets
- **Fully customizable** - Custom render items and swipe actions
- **RTL support** - Built-in right-to-left language support
- **TypeScript** - Full type definitions included
- **Accessibility** - Screen reader support
- **FlashList/FlatList** - Works with any list component
- **Imperative API** - Programmatically control swipe state

## Installation

```bash
npm install react-native-fluid-swipe-list
# or
yarn add react-native-fluid-swipe-list
```

### Dependencies

This package requires the following peer dependencies:

```bash
npm install react-native-gesture-handler react-native-reanimated
```

Make sure to follow the [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/) and [Gesture Handler installation guide](https://docs.swmansion.com/react-native-gesture-handler/) for proper setup.

## Quick Start

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SwipeList } from 'react-native-fluid-swipe-list';

const data = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
  { id: '3', title: 'Item 3' },
];

export default function App() {
  return (
    <SwipeList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      rightActions={(item) => [
        {
          id: 'delete',
          label: 'Delete',
          backgroundColor: '#FF3B30',
          onPress: (item) => console.log('Delete', item),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
});
```

## API Reference

### SwipeList Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | required | Array of items to render |
| `renderItem` | `({ item, index }) => ReactElement` | required | Function to render each item |
| `keyExtractor` | `(item, index) => string` | required | Unique key for each item |
| `leftActions` | `(item, index) => SwipeAction[]` | - | Left swipe actions |
| `rightActions` | `(item, index) => SwipeAction[]` | - | Right swipe actions |
| `disableLeftSwipe` | `boolean \| (item, index) => boolean` | `false` | Disable left swipe |
| `disableRightSwipe` | `boolean \| (item, index) => boolean` | `false` | Disable right swipe |
| `swipeThreshold` | `number` | `0.3` | Threshold to trigger open (0-1) |
| `animationDuration` | `number` | `200` | Animation duration in ms |
| `closeOnScroll` | `boolean` | `true` | Close items when scrolling |
| `closeOnPress` | `boolean` | `true` | Close items when pressing |
| `onSwipeOpen` | `(direction, item) => void` | - | Called when item opens |
| `onSwipeClose` | `(item) => void` | - | Called when item closes |
| `ListComponent` | `React.ComponentType` | `FlatList` | Custom list component |
| `listProps` | `object` | - | Props passed to list component |

### SwipeAction

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Button label text |
| `backgroundColor` | `string` | Background color |
| `icon` | `ReactNode` | Optional icon component |
| `onPress` | `(item) => void` | Press handler |
| `width` | `number` | Button width (default: 80) |
| `style` | `ViewStyle` | Additional styles |
| `textStyle` | `TextStyle` | Label text styles |

## Advanced Usage

### Dynamic Actions per Item

```tsx
<SwipeList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <MessageCard item={item} />}
  leftActions={(item, index) =>
    item.canArchive
      ? [
          {
            id: 'archive',
            label: 'Archive',
            backgroundColor: '#4CAF50',
            onPress: handleArchive,
          },
        ]
      : undefined
  }
  rightActions={(item, index) =>
    item.canDelete
      ? [
          {
            id: 'delete',
            label: 'Delete',
            backgroundColor: '#FF3B30',
            onPress: handleDelete,
          },
        ]
      : undefined
  }
/>
```

### Imperative API

```tsx
import { useRef } from 'react';
import { SwipeList } from 'react-native-fluid-swipe-list';

function App() {
  const listRef = useRef<{ closeAll: () => void }>(null);

  return (
    <>
      <Button title="Close All" onPress={() => listRef.current?.closeAll()} />
      <SwipeList ref={listRef} data={data} {...otherProps} />
    </>
  );
}
```

### Custom SwipeableItem

```tsx
import { SwipeableItem, useSwipeable } from 'react-native-fluid-swipe-list';

function CustomItem({ item }) {
  const { ref, openLeft, close } = useSwipeable();

  return (
    <SwipeableItem
      ref={ref}
      item={item}
      index={0}
      renderItem={({ item }) => <View>...</View>}
      leftActions={[{ id: 'action', label: 'Action', onPress: close }]}
      itemUniqueId={item.id}
    />
  );
}
```

### With FlashList

```tsx
import { FlashList } from '@shopify/flash-list';
import { SwipeList } from 'react-native-fluid-swipe-list';

<SwipeList
  ListComponent={FlashList}
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <View>...</View>}
  listProps={{ estimatedItemSize: 80 }}
/>
```

## 📸 Adding Screenshots & Videos

To showcase your package with compelling visuals:

### Recommended Assets Structure

```
assets/
├── screenshots/
│   ├── left-swipe.png       # Left swipe actions demo
│   ├── right-swipe.png      # Right swipe actions demo
│   ├── both-swipes.png      # Full interaction demo
│   └── thumbnail.png        # Package thumbnail (1200x630)
└── videos/
    └── demo.mp4             # Short demo video (15-30 sec)
```

### Recording Tips

**For Video:**
- Use iOS Simulator or Android Emulator screen recording
- Keep it short (15-30 seconds)
- Show smooth 60 FPS animations
- Demonstrate: open left → open right → close → scroll behavior
- Upload to: YouTube, Vimeo, or GitHub releases

**For Screenshots:**
- Capture at high resolution (iPhone 14 Pro / Pixel 7)
- Show light and dark mode if supported
- Include RTL layout example
- Recommended size: 1170x2532 (iPhone) or 1080x2400 (Android)

### Quick Recording Commands

```bash
# iOS Simulator
xcrun simctl io booted recordVideo demo.mp4

# Android Emulator
adb shell screenrecord /sdcard/demo.mp4
adb pull /sdcard/demo.mp4
```

## License

MIT