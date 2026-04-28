import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { saveEntry } from '../storage/entries';

const REWARDS = [
  'GRATEFUL10',
  'THANKS15',
  'JOY20',
  'BLESSED5',
  'THANKFUL25',
];

const PROMPTS = [
  "What's one thing that made you smile today?",
  "Who are you grateful for right now?",
  "What's something small you often overlook?",
  "What made today better than yesterday?",
  "Name one thing your body did for you today.",
];

export default function GratitudePromptScreen({ navigation }) {
  const [text, setText] = useState('');
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);

    await saveEntry({ text: text.trim(), date: new Date().toISOString() });

    const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];

    Alert.alert(
      'You earned a reward! 🎉',
      `Your discount code:\n\n${reward}\n\nKeep the gratitude going!`,
      [{ text: 'Sweet!', onPress: () => navigation.goBack() }]
    );
    setSubmitting(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Pause & reflect</Text>
        <Text style={styles.prompt}>{prompt}</Text>

        <TextInput
          style={styles.input}
          placeholder="Write what you're grateful for..."
          placeholderTextColor="#bbb"
          multiline
          value={text}
          onChangeText={setText}
          autoFocus
          maxLength={500}
        />
        <Text style={styles.charCount}>{text.length}/500</Text>

        <TouchableOpacity
          style={[styles.submitBtn, !text.trim() && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim() || submitting}
        >
          <Text style={styles.submitText}>Submit & earn reward</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 20, right: 24 },
  closeText: { fontSize: 20, color: '#888' },
  heading: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 12, marginTop: 40 },
  prompt: { fontSize: 16, color: '#aaa', marginBottom: 24, lineHeight: 24 },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 140,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  charCount: { color: '#555', fontSize: 12, textAlign: 'right', marginTop: 6, marginBottom: 24 },
  submitBtn: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  submitDisabled: { backgroundColor: '#444', shadowOpacity: 0 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
