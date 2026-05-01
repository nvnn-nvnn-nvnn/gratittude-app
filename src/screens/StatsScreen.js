import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { getEntries } from '../storage/entries';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function GratefulScale({ entries }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  const entryDates = new Set(
    entries
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(e => new Date(e.date).getDate())
  );

  const weeks = [];
  let week = [];
  const firstDay = new Date(year, month, 1).getDay();

  // pad first week
  for (let i = 0; i < firstDay; i++) week.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.calendarCard}>
      <Text style={styles.calendarTitle}>{monthName}</Text>
      <View style={styles.dayHeaders}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Text key={i} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>
      {weeks.map((w, wi) => (
        <View key={wi} style={styles.week}>
          {w.map((d, di) => (
            <View
              key={di}
              style={[
                styles.day,
                d && entryDates.has(d) && styles.dayFilled,
                d && !entryDates.has(d) && styles.dayEmpty,
                !d && styles.dayBlank,
              ]}
            >
              {d ? <Text style={[styles.dayText, entryDates.has(d) && styles.dayTextFilled]}>{d}</Text> : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function StatsScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  async function load() {
    const data = await getEntries();
    setEntries(data);
  }

  const totalEntries = entries.length;
  const now = new Date();
  const thisMonthEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());
  const gratefulScore = Math.round((thisMonthEntries / daysInMonth) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Progress</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalEntries}</Text>
            <Text style={styles.statLabel}>Total entries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{thisMonthEntries}</Text>
            <Text style={styles.statLabel}>This month</Text>
          </View>
          <View style={[styles.statCard, styles.scoreCard]}>
            <Text style={[styles.statNumber, styles.scoreNumber]}>{gratefulScore}%</Text>
            <Text style={styles.statLabel}>Grateful score</Text>
          </View>
        </View>

        <GratefulScale entries={entries} />

        <View style={styles.aiCard}>
          <Text style={styles.aiLabel}>AI Overview</Text>
          <Text style={styles.aiText}>
            {thisMonthEntries === 0
              ? 'No entries this month yet. Start writing to unlock your AI overview.'
              : `You've logged gratitude ${thisMonthEntries} time${thisMonthEntries > 1 ? 's' : ''} this month. Your grateful score is ${gratefulScore}%. AI summary coming soon with premium.`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A8C3D8' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a2e', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreCard: { backgroundColor: '#6C63FF' },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#1a1a2e' },
  scoreNumber: { color: '#fff' },
  statLabel: { fontSize: 11, color: '#aaa', marginTop: 4, textAlign: 'center' },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  calendarTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 12, textAlign: 'center' },
  dayHeaders: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  dayHeader: { fontSize: 12, fontWeight: '700', color: '#aaa', width: 32, textAlign: 'center' },
  week: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayBlank: {},
  dayEmpty: { backgroundColor: '#f0f0f0' },
  dayFilled: { backgroundColor: '#6C63FF' },
  dayText: { fontSize: 12, color: '#555', fontWeight: '600' },
  dayTextFilled: { color: '#fff' },
  aiCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  aiLabel: { fontSize: 11, fontWeight: '700', color: '#6C63FF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  aiText: { fontSize: 14, color: '#ccc', lineHeight: 22 },
});
