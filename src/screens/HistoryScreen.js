import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { getEntries } from '../storage/entries';

function EntryCard({ item }) {
  const date = new Date(item.date);
  const label = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.entryText}>{item.text}</Text>
    </View>
  );
}

export default function HistoryScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  async function load() {
    const data = await getEntries();
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(sorted);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Journal</Text>
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No entries yet.</Text>
          <Text style={styles.emptySubtext}>Start writing what you're grateful for!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <EntryCard item={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB' },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a2e', margin: 24, marginBottom: 12 },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dateLabel: { fontSize: 11, fontWeight: '700', color: '#6C63FF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  entryText: { fontSize: 15, color: '#333', lineHeight: 22 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#aaa' },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 8 },
});
