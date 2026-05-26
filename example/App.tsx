import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Button,
  Alert,
} from 'react-native';
import { SwipeList } from 'react-native-fluid-swipe-list';

interface Message {
  id: string;
  title: string;
  subtitle: string;
  unread: boolean;
  archived: boolean;
}

const generateData = (count: number): Message[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Message ${i + 1}`,
    subtitle: `This is the preview text for message ${i + 1}`,
    unread: i % 3 === 0,
    archived: false,
  }));
};

export default function App() {
  const [data, setData] = React.useState<Message[]>(() => generateData(20));
  const listRef = useRef<{ closeAll: () => void }>(null);

  const handleDelete = useCallback((item: Message) => {
    Alert.alert('Delete', `Delete ${item.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setData((prev) => prev.filter((i) => i.id !== item.id));
        },
      },
    ]);
  }, []);

  const handleArchive = useCallback((item: Message) => {
    setData((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, archived: !i.archived } : i))
    );
  }, []);

  const handleMarkRead = useCallback((item: Message) => {
    setData((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, unread: !i.unread } : i))
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: Message }) => {
    return (
      <View style={[styles.item, item.archived && styles.archived]}>
        <View style={styles.content}>
          <Text style={[styles.title, item.unread && styles.unread]}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
        {item.unread && <View style={styles.badge} />}
      </View>
    );
  }, []);

  const leftActions = useCallback(
    (item: Message) => [
      {
        id: 'archive',
        label: item.archived ? 'Unarchive' : 'Archive',
        backgroundColor: '#4CAF50',
        onPress: handleArchive,
      },
      {
        id: 'read',
        label: item.unread ? 'Mark Read' : 'Mark Unread',
        backgroundColor: '#2196F3',
        onPress: handleMarkRead,
      },
    ],
    [handleArchive, handleMarkRead]
  );

  const rightActions = useCallback(
    (item: Message) => [
      {
        id: 'delete',
        label: 'Delete',
        backgroundColor: '#FF3B30',
        onPress: handleDelete,
      },
    ],
    [handleDelete]
  );

  const disableLeftSwipe = useCallback((item: Message) => item.archived, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swipe List Demo</Text>
        <Button title="Close All" onPress={() => listRef.current?.closeAll()} />
      </View>
      <SwipeList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        leftActions={leftActions}
        rightActions={rightActions}
        disableLeftSwipe={disableLeftSwipe}
        onSwipeOpen={(direction, item) =>
          console.log(`Opened ${direction} for ${item.title}`)
        }
        onSwipeClose={(item) => console.log(`Closed ${item.title}`)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  archived: {
    backgroundColor: '#F0F0F0',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
  },
  unread: {
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
});
