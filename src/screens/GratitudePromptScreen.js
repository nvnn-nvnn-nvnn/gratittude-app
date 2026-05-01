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
  Alert,
} from 'react-native';
import { saveEntry, updateEntry, getEntries } from '../storage/entries';

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

function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  return d.toISOString().split('T')[0];
}

export default function GratitudePromptScreen({ route, navigation }) {
  const editingEntry = route?.params?.entry;
  const isEditing = !!editingEntry;

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

    const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];

    Alert.alert(
      'You earned a reward! 🎉',
      `Your discount code:\n\n${reward}\n\nKeep the gratitude going!`,
      [{ text: 'Sweet!', onPress: () => navigation.goBack() }]
    );
  }

  const subLabel = isEditing
    ? new Date(lockedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : prompt;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <Animated.View style={[styles.fadeWrap, { opacity, transform: [{ translateY }] }]}>
          <Text style={styles.heading}>
            {isEditing ? 'Edit reflection' : 'Pause & reflect'}
          </Text>
          <Text style={styles.sub}>{subLabel}</Text>
          
          {!isEditing && (
            <Text style={styles.dateLock}>Writing for: {lockedDate}</Text>
          )}

          <Animated.View style={styles.paper}>
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
            <Text style={styles.charCount}>{text.length}/500</Text>
          </Animated.View>

          <TouchableOpacity
            style={[styles.submitBtn, (!text.trim() || submitting) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!text.trim() || submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {submitting 
                ? 'Saving...' 
                : isEditing 
                  ? 'Save changes' 
                  : 'Submit & earn reward'
              }
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#A8C3D8',
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 999,
  },
  closeText: { 
    fontSize: 18, 
    color: '#1a1a2e', 
    fontWeight: '700',
    lineHeight: 22,
  },
  inner: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    paddingBottom: 32, 
    justifyContent: 'center',
    zIndex: 1,
  },
  fadeWrap: { 
    width: '100%',
  },
  heading: {
    fontFamily: 'DancingScript_700Bold',
    fontSize: 44,
    color: '#fff',
    marginTop: 20,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    letterSpacing: 0.4,
    marginBottom: 4,
    lineHeight: 20,
  },
  dateLock: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
    fontWeight: '600',
  },
  paper: {
    backgroundColor: '#FAF6EC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    padding: 18,
    minHeight: 200,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.12)',
    marginBottom: 20,
  },
  input: {
    fontSize: 17,
    color: '#1a1a2e',
    minHeight: 140,
    lineHeight: 26,
    padding: 0,
  },
  charCount: {
    color: '#bba88a',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  submitBtn: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    boxShadow: '0px 6px 14px rgba(26,26,46,0.25)',
  },
  submitDisabled: {
    backgroundColor: '#7a93a8',
    boxShadow: 'none',
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});