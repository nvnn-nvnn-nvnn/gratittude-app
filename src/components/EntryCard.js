import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet, 
} from 'react-native';

function EntryCard({ item, onPress }) {   // ← fixed: { item, onPress }

  const date = new Date(item.date);
  const label = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.entryText} numberOfLines={3}>{item.text}</Text>
      <Text style={styles.editHint}>Tap to edit</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  editHint: { fontSize: 11, color: '#bbb', marginTop: 8, fontStyle: 'italic' },
});

export default EntryCard;