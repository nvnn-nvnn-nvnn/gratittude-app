import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { getEntries } from '../storage/entries';
import { POIGNANT_QUOTES, getRandomQuote } from '../constants/quotes';
import { useTheme } from '../context/ThemeContext';

function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  return d.toISOString().split('T')[0];
}

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

  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
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
              {d ? (
                <Text style={[styles.dayText, entryDates.has(d) && styles.dayTextFilled]}>
                  {d}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function StatRow({ label, value, last }) {
  return (
    <View style={[styles.statRow, !last && styles.statRowBorder]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statNumber}>{value}</Text>
    </View>
  );
}

export default function StatsScreen({ navigation }) {
  const { bgColor } = useTheme();
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  // Quotes

  const [quotes] = useState(getRandomQuote());


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  async function load() {
    const data = await getEntries();
    setEntries(data);

    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Current streak
    let s = 0;
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

    // Longest streak
    const uniqueDates = [...new Set(sorted.map(e => normalizeDate(e.date)))].sort();
    let longest = 0;
    let current = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        current = 1;
      } else {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        current = diff === 1 ? current + 1 : 1;
      }
      if (current > longest) longest = current;
    }
    setLongestStreak(longest);

    // This week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setWeekCount(data.filter(e => new Date(normalizeDate(e.date)) >= new Date(normalizeDate(weekAgo))).length);








  }

  const totalEntries = entries.length;
  const points = totalEntries;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Progress</Text>

        <View style={styles.statsBook}>
          <StatRow label="Total entries" value={totalEntries} />
          <StatRow label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
          <StatRow label="Longest streak" value={`${longestStreak} day${longestStreak === 1 ? '' : 's'}`} />
          <StatRow label="Entries this week" value={weekCount} />
          <StatRow label="Points earned" value={points} last />
        </View>

        <Text style={styles.sectionLabel}>This month</Text>
        <GratefulScale entries={entries} />

        <View style={styles.quoteWrap}>
          <Text style={styles.quoteLabel}>Quote of the day</Text>
          <Text style={styles.quote}>{quotes}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A8C3D8' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FAF6EC',
    fontFamily: 'DancingScript_700Bold',
    marginTop: 40,
    marginBottom: 16,
  },

  statsBook: {
    backgroundColor: '#FAF6EC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8bc9e',
    marginBottom: 28,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  statRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0cc',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C3A5C',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a7a5c',
    letterSpacing: 0.3,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF6EC',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  calendarCard: {
    backgroundColor: '#FAF6EC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8bc9e',
    padding: 16,
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C3A5C',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  dayHeaders: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  dayHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a7a5c',
    width: 32,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  week: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayBlank: {},
  dayEmpty: { backgroundColor: 'rgba(200,188,158,0.2)' },
  dayFilled: { backgroundColor: '#bb7c23' },
  dayText: { fontSize: 12, color: '#1C3A5C', fontWeight: '600' },
  dayTextFilled: { color: '#FAF6EC' },

  quoteWrap: {
    backgroundColor: 'rgba(250,246,236,0.2)',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 20,
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
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
