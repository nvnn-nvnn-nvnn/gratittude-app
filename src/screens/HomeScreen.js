import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { getEntries, clearEntries } from '../storage/entries';

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

// SAME normalization as GratitudePromptScreen
function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  return d.toISOString().split('T')[0]; // "2026-04-30"
}

export default function HomeScreen({ navigation }) {
  const [streak, setStreak] = useState(0);
  const [todayEntry, setTodayEntry] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [weekCount, setWeekCount] = useState(0);
  const todayDone = !!todayEntry;

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  async function loadStats() {
    const entries = await getEntries();
    
    // Use SAME normalization as GratitudePromptScreen
    const todayStr = normalizeDate(new Date());
    const found = entries.find(e => normalizeDate(e.date) === todayStr);
    setTodayEntry(found || null);

    // Streak calc using normalized dates
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
        // Entry from future? Skip it
        continue;
      } else {
        break;
      }
    }
    setStreak(s);

    setRecentEntries(sorted.slice(0, 3));

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setWeekCount(entries.filter(e => new Date(e.date) >= weekAgo).length);
  }

  const today = new Date().toLocaleDateString('en-us', {
    month: 'long',
    weekday: 'long', 
    day: "numeric",
    year: "numeric"
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, {
          color: 'white',
          textAlign: 'left',
          alignSelf: 'stretch',
          fontFamily: 'DancingScript_700Bold',
          fontSize: 48,
        }]}>{getGreeting()}</Text>

        {(streak > 0 || weekCount > 0) && (
          <Text style={styles.statsLine}>
            {streak > 0 && `${streak} day${streak === 1 ? '' : 's'} in a row`}
            {streak > 0 && weekCount > 0 && '   ·   '}
            {weekCount > 0 && `${weekCount} this week`}
          </Text>
        )}

        <TouchableOpacity
          style={styles.dateCard}
          activeOpacity={0.8}
          onPress={() => {
            const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
            Alert.alert('Did you know?', fact);
          }}
        >
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.dateValue}>{today}</Text>
        </TouchableOpacity>

        <View style={styles.quoteCard}>
          <Text style={styles.quote}>
            "Today's quote goes here — a placeholder until random quotes are wired up."
          </Text>
        </View>
        <View style={styles.divider} />

        {/* TEMP WIPE BUTTON — REMOVE AFTER TESTING */}
        <TouchableOpacity
          style={styles.wipeButton}
          onPress={() => {
            Alert.alert(
              'Wipe All Entries?',
              'This deletes everything permanently.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Wipe', 
                  style: 'destructive',
                  onPress: async () => {
                    await clearEntries();
                    loadStats();
                    Alert.alert('Wiped', 'All entries deleted.');
                  }
                },
              ]
            );
          }}
        >
          <Text style={styles.wipeText}>🗑 WIPE ALL ENTRIES (TESTING)</Text>
        </TouchableOpacity>

        <View style={styles.journalSection}>
          <Text style={styles.journalText}>
            How are you feeling today?
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
              {todayDone ? 'Written today.' : 'Today, I’m grateful for…'}
            </Text>
            {todayDone && (
              <Text style={styles.journalDoneHint}>tap to revisit</Text>
            )}
          </TouchableOpacity>
        </View>

        {recentEntries.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentHeading}>Recent reflections</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Journal')}>
                <Text style={styles.recentSeeAll}>See all →</Text>
              </TouchableOpacity>
            </View>

            {recentEntries.map((entry, i) => {
              const dateLabel = new Date(entry.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              return (
                <TouchableOpacity
                  key={entry.id || i}
                  style={styles.recentCard}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('GratitudePrompt', { entry })}
                >
                  <Text style={styles.recentDate}>{dateLabel}</Text>
                  <Text style={styles.recentText} numberOfLines={3}>{entry.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A8C3D8' },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#1a1a2e', marginTop: 20 },
  statsLine: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontStyle: 'italic',
    letterSpacing: 0.6,
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  dateCard: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 4,
    marginBottom: 20,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
  },
  dateLabel: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dateValue: {
    color: '#bb7c23',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 22,
  },
  quoteCard: {
    backgroundColor: '#8CA9C2',
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  quote: {
    color: '#f5e9d0',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'left',
    lineHeight: 26,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignSelf: 'stretch',
    marginVertical: 20,
  },
  // TEMP WIPE BUTTON — REMOVE AFTER TESTING
  wipeButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
  wipeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  journalSection: {
    width: '100%',
    marginVertical: 10,
  },
  journalText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 20, 
    marginBottom: 8
  },
  journalCard: {
    backgroundColor: '#FAF6EC',
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 4,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
  },
  journalCardDone: {
    backgroundColor: '#F4EFE3',
  },
  journalPrompt: {
    fontFamily: 'DancingScript_400Regular',
    fontSize: 30,
    color: '#1a1a2e',
    lineHeight: 40,
  },
  journalPromptDone: {
    color: '#5a5a6e',
  },
  journalDoneHint: {
    fontSize: 12,
    color: '#8a7a5c',
    fontStyle: 'italic',
    marginTop: 6,
  },
  recentSection: { 
    width: '100%', 
    marginTop: 32, 
    marginBottom: 24 
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
  },
  recentDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C63FF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  recentText: { 
    fontSize: 14, 
    color: '#333', 
    lineHeight: 20 
  },
  recentSeeAll: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'right',
    marginTop: 4,
  },
});