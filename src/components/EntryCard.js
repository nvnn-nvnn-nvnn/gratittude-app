import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfirmModal from './ConfirmModal';

function EntryCard({ item, onPress, onDelete }) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [y, m, d] = item.date.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  function handleConfirm() {
    setConfirmVisible(false);
    onDelete?.();
  }

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
        <View style={styles.header}>
          <Text style={styles.dateLabel}>{label}</Text>
          <TouchableOpacity
            onPress={() => setConfirmVisible(true)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color="#b0a090" />
          </TouchableOpacity>
        </View>
        <Text style={styles.entryText} numberOfLines={3}>{item.text}</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete this reflection?"
        message="This entry will be permanently removed. You can't undo this."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAF6EC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8bc9e',
    padding: 18,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8a7a5c',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  entryText: {
    fontSize: 16,
    color: '#1a1a2e',
    lineHeight: 24,
  },
});

export default EntryCard;
