import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { getEntries } from '../storage/entries';

const PROMPTS = [
  "What's one thing that made you smile today?",
  "Who are you grateful for right now?",
  "What's something small you often overlook?",
  "What made today better than yesterday?",
  "Name one thing your body did for you today.",
];

export default function HomeScreen({ navigation }) {
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  async function loadStats() {
    const entries = await getEntries();
    const today = new Date().toDateString();
    const todayEntry = entries.find(e => new Date(e.date).toDateString() === today);
    setTodayDone(!!todayEntry);

    // simple streak calc
    let s = 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    let check = new Date();
    for (const entry of sorted) {
      const d = new Date(entry.date).toDateString();
      if (d === check.toDateString()) {
        s++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(s);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Gratitude</Text>
        <Text style={styles.subtitle}>A little thanks goes a long way.</Text>

        <View style={styles.streakCard}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>Today's prompt</Text>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, todayDone && styles.buttonDone]}
          onPress={() => navigation.navigate('GratitudePrompt')}
          disabled={todayDone}
        >
          <Text style={styles.buttonText}>
            {todayDone ? 'Done for today ✓' : "I'm grateful for..."}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6FF' },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#1a1a2e', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 32 },
  streakCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  streakNumber: { fontSize: 56, fontWeight: '900', color: '#fff' },
  streakLabel: { fontSize: 16, color: '#ddd', marginTop: 4 },
  promptCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  promptLabel: { fontSize: 11, fontWeight: '700', color: '#6C63FF', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  promptText: { fontSize: 18, color: '#333', lineHeight: 26 },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDone: { backgroundColor: '#ccc', shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
