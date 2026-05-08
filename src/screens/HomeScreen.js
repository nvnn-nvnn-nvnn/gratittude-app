import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EntryCard from '../components/EntryCard';
import { getEntries, clearEntries, deleteEntry } from '../storage/entries';

import { POIGNANT_QUOTES, getRandomQuote } from '../constants/quotes';
import { useTheme } from '../context/ThemeContext';

const FUN_FACTS = [
  "Practicing gratitude regularly can lower stress hormones by up to 23%.",
  "People who keep gratitude journals report sleeping 30 minutes longer on average.",
  "Saying 'thank you' activates the same brain regions as receiving a reward.",
  "Gratitude is contagious — one thank-you can spark several more in a group.",
  "Just two minutes of reflecting on the good can lift your mood for the rest of the day.",
  "Grateful people tend to exercise more and visit the doctor less often.",
  "Writing down what you're grateful for is more effective than just thinking it.",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  return d.toISOString().split('T')[0];
}

export default function HomeScreen({ navigation }) {
  const { bgColor } = useTheme();
  const [streak, setStreak] = useState(0);
  const [todayEntry, setTodayEntry] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [weekCount, setWeekCount] = useState(0);
  const todayDone = !!todayEntry;
  // Quotes

  const [quotes] = useState(getRandomQuote());

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  async function loadStats() {
    const entries = await getEntries();
    const todayStr = normalizeDate(new Date());
    const found = entries.find(e => normalizeDate(e.date) === todayStr);
    setTodayEntry(found || null);

    let s = 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    let check = new Date();
    
    for (const entry of sorted) {
      const entryDate = normalizeDate(entry.date);
      const checkStr = normalizeDate(check);
      
      if (entryDate === checkStr) {
        s++;
        check.setDate(check.getDate() - 1);
      } else if (entryDate > checkStr) {
        continue;
      } else {
        break;
      }
    }
    setStreak(s);
    setRecentEntries(sorted.slice(0, 3));
    const weekAgo = new Date();s
    weekAgo.setDate(weekAgo.getDate() - 7);
    setWeekCount(entries.filter(e => new Date(e.date) >= weekAgo).length);
  }

  async function handleDelete(id) {
    await deleteEntry(id);
    loadStats();
  }

  const today = new Date().toLocaleDateString('en-us', {
    month: 'long',
    weekday: 'long', 
    day: "numeric",
    year: "numeric"
  });

  // Header content component
  const ListHeader = () => (
    <View>
      <Text style={styles.title}>{getGreeting()}</Text>

      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => {
          const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
          Alert.alert('Did you know?', fact);
        }}
      >
        <Text style={styles.dateSubtitle}>{today}</Text>
      </TouchableOpacity>

      {(streak > 0 || weekCount > 0) && (
        <Text style={styles.statsLine}>
          {streak > 0 && `${streak} day${streak === 1 ? '' : 's'} in a row`}
          {streak > 0 && weekCount > 0 && '   ·   '}
          {weekCount > 0 && `${weekCount} this week`}
        </Text>
      )}

      <View style={styles.journalSection}>
        <Text style={styles.journalLabel}>
          {todayDone ? "Today's reflection" : 'How are you feeling today?'}
        </Text>
        <TouchableOpacity
          style={[styles.journalCard, todayDone && styles.journalCardDone]}
          onPress={() =>
            navigation.navigate(
              'GratitudePrompt',
              todayDone ? { entry: todayEntry } : undefined
            )
          }
          activeOpacity={0.7}
        >
          <Text style={[styles.journalPrompt, todayDone && styles.journalPromptDone]}>
            {todayDone ? 'Written today.' : "Today, I'm grateful for…"}
          </Text>
          {todayDone && (
            <Text style={styles.journalDoneHint}>tap to revisit</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.quoteWrap}>
        <Text style={styles.quoteLabel}>Today's Quote</Text>
        <Text style={styles.quote}>{quotes}</Text>
      </View>

      <View style={styles.recentHeader}>
        <Text style={styles.recentHeading}>Recent reflections</Text>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={() => navigation.navigate('Journal')}
          activeOpacity={0.6}
        >
          <Text style={styles.recentSeeAll}>See all</Text>
          <Ionicons name="chevron-forward" size={15} color="#1a1a2e" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty state component
  const EmptyList = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No entries yet.</Text>
      <Text style={styles.emptySubtext}>Start your gratitude journey today!</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={recentEntries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<EmptyList />}
        renderItem={({ item }) => (
          <EntryCard
            item={item}
            onPress={() => navigation.navigate('GratitudePrompt', { entry: item })}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A8C3D8' },
  content: { padding: 24, paddingBottom: 40 },
  title: {
    fontSize: 62,
    fontWeight: '800',
    color: '#FAF6EC',
    fontFamily: 'DancingScript_700Bold',
    marginTop: 20,
    marginBottom: 2,
  },
  dateSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  statsLine: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  journalSection: {
    width: '100%',
    marginBottom: 24,
  },
  journalLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  journalCard: {
    backgroundColor: '#FAF6EC',
    width: '100%',
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 4,
    boxShadow: '0px 4px 14px rgba(0,0,0,0.13)',
    minHeight: 120,
  },
  journalCardDone: {
    backgroundColor: '#F4EFE3',
  },
  journalPrompt: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 44,
    color: '#1a1a2e',
    lineHeight: 58,
  },
  journalPromptDone: {
    color: '#5a5a6e',
  },
  journalDoneHint: {
    fontSize: 15,
    color: '#8a7a5c',
    fontStyle: 'italic',
    marginTop: 10,
  },
  quoteWrap: {
    backgroundColor: 'rgba(250,246,236,0.2)',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 32,
  },
  quoteLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  quote: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  recentHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  recentSeeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#888',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});