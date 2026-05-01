import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Share,
} from 'react-native';
import  EntryCard  from '../components/EntryCard'
import { Calendar } from 'react-native-calendars';
import { getEntries, saveEntry } from '../storage/entries';


export default function JournalScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  // Submitting

  const [isSubmitting, setIsSubmitting ] = useState(false);

  const load = useCallback(async () => {
    const data = await getEntries();
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(sorted);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === todayStr);
  const todayDone = !!todayEntry;

  const markedDates = entries.reduce((acc, entry) => {
    acc[entry.date] = { marked: true, dotColor: '#6C63FF' };
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#6C63FF',
    };
  }

  const handleShare = async (entry) => {
    try {
      await Share.share({
        message: `${entry.date}\n\n${entry.text}`,
        title: 'My Gratitude Entry',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
    const entry = entries.find(e => e.date === day.dateString);
    navigation.navigate('GratitudePrompt', { date: day.dateString, entry });
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Daily Prompt Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPrompt}
        onRequestClose={() => setShowPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {todayDone ? "Today's Gratitude" : "What are you grateful for today?"}
            </Text>
            <Text style={styles.modalDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            
            {todayDone ? (
              <>
                <Text style={styles.modalText}>{todayEntry.text}</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => {
                    setShowPrompt(false);
                    navigation.navigate('GratitudePrompt', { entry: todayEntry });
                  }}>
                    <Text style={styles.modalBtnText}>Edit Entry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.secondaryBtn]} onPress={() => handleShare(todayEntry)}>
                    <Text style={[styles.modalBtnText, styles.secondaryBtnText]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalHint}>Take a moment to reflect on what made today special...</Text>
                <TouchableOpacity style={styles.modalBtn} onPress={() => {
                  setShowPrompt(false);
                  navigation.navigate('GratitudePrompt', { date: todayStr });
                }}>
                  <Text style={styles.modalBtnText}>Start Writing</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPrompt(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        animationType="slide"
        visible={showCalendar}
        onRequestClose={() => setShowCalendar(false)}
      >
        <SafeAreaView style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Your Gratitude Calendar</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <Text style={styles.closeCalendar}>✕</Text>
            </TouchableOpacity>
          </View>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              todayTextColor: '#6C63FF',
              arrowColor: '#6C63FF',
            }}
          />
        </SafeAreaView>
      </Modal>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id ?? item.date}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Your Journal</Text>

            {/* Today's Prompt Card */}
            <TouchableOpacity 
              style={styles.promptCard}
              onPress={() => setShowPrompt(true)}
              activeOpacity={0.85}
            >
              <View style={styles.promptHeader}>
                <Text style={styles.promptLabel}>Today</Text>
                <View style={[styles.statusBadge, todayDone && styles.statusDone]}>
                  <Text style={styles.statusText}>{todayDone ? '✓ Done' : 'Pending'}</Text>
                </View>
              </View>
              <Text style={styles.promptText}>
                {todayDone ? todayEntry.text : "Tap to write today's gratitude..."}
              </Text>
              {!todayDone && <Text style={styles.promptCta}>+ New Entry</Text>}
            </TouchableOpacity>

            {/* Calendar Toggle */}
            <TouchableOpacity style={styles.calendarToggle} onPress={() => setShowCalendar(true)}>
              <Text style={styles.calendarToggleText}>📅 View Calendar</Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>Previous Entries</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No entries yet.</Text>
            <Text style={styles.emptySubtext}>Start your gratitude journey today!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            item={item}
            onPress={() => navigation.navigate('GratitudePrompt', { entry: item })}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A8C3D8' },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
    fontFamily: 'DancingScript_700Bold',
    marginTop: 24,
    marginBottom: 16,
  },

  // Prompt Card
  promptCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C63FF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDone: { backgroundColor: '#d4edda' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#666' },
  promptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  promptCta: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },

  // Calendar Toggle
  calendarToggle: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
    opacity: 0.8,
  },

  // Entry Cards
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

  // Empty State
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#888' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  modalDate: { fontSize: 14, color: '#6C63FF', marginBottom: 16, fontWeight: '600' },
  modalText: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 20 },
  modalHint: { fontSize: 15, color: '#888', lineHeight: 22, marginBottom: 20, fontStyle: 'italic' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: {
    flex: 1,
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtn: { backgroundColor: '#f0f0f0' },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtnText: { color: '#333' },
  closeBtn: { marginTop: 16, alignSelf: 'center' },
  closeBtnText: { color: '#999', fontSize: 14 },

  // Calendar Modal
  calendarModal: { flex: 1, backgroundColor: '#fff' },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  calendarTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  closeCalendar: { fontSize: 24, color: '#666', padding: 8 },
});