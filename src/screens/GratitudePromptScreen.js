import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry, updateEntry, getEntries } from '../storage/entries';

import { getRandomQuote } from '../constants/quotes';

const PROMPTS = [
  "What's one thing that made you smile today?",
  "Who are you grateful for right now?",
  "What's something small you often overlook?",
  "What made today better than yesterday?",
  "Name one thing your body did for you today.",
];

function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  return d.toISOString().split('T')[0];
}

export default function GratitudePromptScreen({ route, navigation }) {
  const editingEntry = route?.params?.entry;
  const isEditing = !!editingEntry;

  const [quote] = useState(getRandomQuote());

  const [lockedDate] = useState(() => {
    if (editingEntry?.date) {
      return normalizeDate(editingEntry.date);
    }
    if (route?.params?.date) {
      return normalizeDate(route.params.date);
    }
    return normalizeDate(new Date());
  });

  const [text, setText] = useState(editingEntry?.text ?? '');
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [submitting, setSubmitting] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [opacity, translateY]);

  async function handleSubmit() {
    if (submitting) return;
    if (!text.trim()) return;

    setSubmitting(true);

    if (!isEditing) {
      const allEntries = await getEntries();
      const existing = allEntries.find(e => normalizeDate(e.date) === lockedDate);

      if (existing) {
        setSubmitting(false);
        Alert.alert(
          'Entry already exists',
          `You already have an entry for ${lockedDate}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Edit', 
              onPress: () => navigation.replace('GratitudePrompt', { entry: existing })
            },
          ]
        );
        return;
      }
    }

    if (isEditing) {
      await updateEntry(editingEntry.id, { 
        text: text.trim(),
        date: lockedDate,
      });
      setSubmitting(false);
      navigation.goBack();
      return;
    }

    await saveEntry({ 
      text: text.trim(), 
      date: lockedDate,
    });

    setSubmitting(false);
    navigation.goBack();
  }

  const subLabel = isEditing
    ? (() => {
        const [y, m, d] = lockedDate.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
      })()
    : prompt;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.fadeWrap, { opacity, transform: [{ translateY }] }]}>

            <View style={styles.topRow}>
              <View>
                <Text style={styles.heading}>
                  {isEditing ? 'Edit reflection' : 'Pause & reflect'}
                </Text>
                <Text style={styles.sub}>{subLabel}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              >
                <Ionicons name="close" size={26} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            <View style={styles.paper}>
              <TextInput
                style={styles.input}
                placeholder="I'm grateful for…"
                placeholderTextColor="#bba88a"
                multiline
                value={text}
                onChangeText={setText}
                autoFocus
                maxLength={500}
                textAlignVertical="top"
              />
              <View style={styles.paperFooter}>
                <Text style={styles.charCount}>{text.length}/500</Text>
                <TouchableOpacity
                  style={[styles.submitBtn, (!text.trim() || submitting) && styles.submitDisabled]}
                  onPress={handleSubmit}
                  disabled={!text.trim() || submitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitText}>
                    {submitting ? 'Saving' : isEditing ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quoteWrap}>
              <Text style={styles.quote}>{quote}</Text>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8C3D8',
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  fadeWrap: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heading: {
    fontFamily: 'DancingScript_700Bold',
    fontSize: 48,
    color: '#fff',
    marginBottom: 4,
  },
  sub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
    lineHeight: 22,
    maxWidth: 260,
  },
  paper: {
    backgroundColor: '#FAF6EC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8bc9e',
    padding: 22,
    minHeight: 620,
    marginBottom: 20,
  },
  input: {
    fontSize: 18,
    color: '#1a1a2e',
    minHeight: 540,
    lineHeight: 28,
    padding: 0,
  },
  paperFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  charCount: {
    color: '#bba88a',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitDisabled: {
    backgroundColor: '#7a93a8',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  quoteWrap: {
    backgroundColor: 'rgba(250,246,236,0.2)',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 24,
  },
  quote: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});