import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getEntries } from '../storage/entries';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useSub } from '../context/SubContext';
import ProModal from '../components/ProModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function scheduleDaily() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to reflect',
      body: 'What are you grateful for today?',
    },
    trigger: { hour: 8, minute: 0, repeats: true },
  });
}

function SectionLabel({ label }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function SettingRow({ icon, label, sub, onPress, right, last }) {
  const Inner = (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={18} color="#1C3A5C" />
        </View>
        <View>
          <Text style={styles.rowLabel}>{label}</Text>
          {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
        </View>
      </View>
      <View style={styles.rowRight}>{right}</View>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{Inner}</TouchableOpacity>;
  }
  return Inner;
}

export default function ProfileScreen() {
  const { bgColor, setBgColor } = useTheme();
  const { isUserPro } = useSub();
  const [remindersOn, setRemindersOn] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(true);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('reminders_on').then(val => setRemindersOn(val === 'true'));
    AsyncStorage.getItem('analytics_on').then(val => setAnalyticsOn(val !== 'false'));
  }, []);

  async function toggleAnalytics(value) {
    setAnalyticsOn(value);
    await AsyncStorage.setItem('analytics_on', String(value));
  }

  async function toggleReminders(value) {
    setRemindersOn(value);
    await AsyncStorage.setItem('reminders_on', String(value));
    if (value) {
      if (!Device.isDevice) {
        Alert.alert('Notifications only work on a physical device.');
        setRemindersOn(false);
        return;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Enable notifications in your device settings.');
        setRemindersOn(false);
        await AsyncStorage.setItem('reminders_on', 'false');
        return;
      }
      await scheduleDaily();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  async function handleExport() {
    const entries = await getEntries();
    if (!entries.length) {
      Alert.alert('Nothing to export', 'Write some entries first.');
      return;
    }
    const text = [...entries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(e => `${e.date}\n\n${e.text}`)
      .join('\n\n---\n\n');
    Share.share({ message: text, title: 'My Gratitude Journal' });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ProModal visible={showProModal} onClose={() => setShowProModal(false)} />
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>your space, your way</Text>

        {/* Pro banner */}
        {!isUserPro && (
          <TouchableOpacity style={styles.proBanner} onPress={() => setShowProModal(true)} activeOpacity={0.85}>
            <View style={styles.proBannerLeft}>
              <Ionicons name="star" size={16} color="#bb7c23" />
              <Text style={styles.proBannerText}>Upgrade to Solicitous Pro</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#bb7c23" />
          </TouchableOpacity>
        )}

        {/* Notifications */}
        <SectionLabel label="Notifications" />
        <View style={styles.card}>
          <SettingRow
            icon="notifications-outline"
            label="Daily Reminders"
            sub="Get a nudge to write each day"
            right={
              <Switch
                value={remindersOn}
                onValueChange={toggleReminders}
                trackColor={{ false: '#c8bc9e', true: '#1C3A5C' }}
                thumbColor="#FAF6EC"
              />
            }
          />
          <SettingRow
            icon="time-outline"
            label="Reminder Time"
            sub={isUserPro ? 'Tap to change' : 'Pro only · 8:00 AM'}
            last
            onPress={() => {
              if (!isUserPro) { setShowProModal(true); return; }
            }}
            right={
              isUserPro
                ? <Ionicons name="chevron-forward" size={18} color="#8a7a5c" />
                : <Ionicons name="lock-closed-outline" size={16} color="#c8bc9e" />
            }
          />
        </View>

        {/* Appearance */}
        <SectionLabel label="Appearance" />
        <View style={styles.card}>
          <View style={styles.swatchSection}>
            <Text style={styles.swatchHeading}>Background Theme</Text>
            <View style={styles.swatchRow}>
              {THEMES.map(t => {
                const locked = !t.free && !isUserPro;
                return (
                  <TouchableOpacity
                    key={t.key}
                    activeOpacity={locked ? 1 : 0.8}
                    style={styles.swatchWrap}
                    onPress={() => {
                      if (locked) { setShowProModal(true); return; }
                      setBgColor(t.color);
                    }}
                  >
                    <View style={[
                      styles.swatch,
                      { backgroundColor: t.color },
                      bgColor === t.color && styles.swatchSelected,
                      locked && styles.swatchLocked,
                    ]}>
                      {locked && <Ionicons name="lock-closed" size={13} color="rgba(255,255,255,0.9)" />}
                    </View>
                    <Text style={[
                      styles.swatchName,
                      bgColor === t.color && styles.swatchNameActive,
                      locked && styles.swatchNameLocked,
                    ]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Backup & Export */}
        <SectionLabel label="Backup & Export" />
        <View style={styles.card}>
          <SettingRow
            icon="share-outline"
            label="Export Journal"
            sub="Share all entries as plain text"
            onPress={handleExport}
            right={<Ionicons name="chevron-forward" size={18} color="#8a7a5c" />}
          />
          <SettingRow
            icon="cloud-upload-outline"
            label="Cloud Backup"
            sub="Pro only · Coming soon"
            last
            onPress={() => { if (!isUserPro) setShowProModal(true); }}
            right={<Ionicons name="lock-closed-outline" size={16} color="#c8bc9e" />}
          />
        </View>

        {/* App Information */}
        <SectionLabel label="App Information" />
        <View style={[styles.card, styles.appInfoCard]}>
          <Text style={styles.appName}>Solicitous</Text>
          <Text style={styles.appTagline}>A gratitude journal for the thoughtful.</Text>
          <View style={styles.appInfoDivider} />
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Built by</Text>
            <Text style={styles.appInfoValue}>Devan Lee</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Made with</Text>
            <Text style={styles.appInfoValue}>React Native & Expo</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Released</Text>
            <Text style={styles.appInfoValue}>May 2026</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SettingRow
            icon="help-circle-outline"
            label="FAQ"
            onPress={() => Linking.openURL('https://yoursite.com/faq')}
            right={<Ionicons name="chevron-forward" size={18} color="#8a7a5c" />}
          />
          <SettingRow
            icon="share-social-outline"
            label="Share the App"
            onPress={() => Share.share({ message: 'Check out Solicitous — a gratitude journal: https://yoursite.com' })}
            right={<Ionicons name="chevron-forward" size={18} color="#8a7a5c" />}
          />
          <SettingRow
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://yoursite.com/privacy')}
            right={<Ionicons name="chevron-forward" size={18} color="#8a7a5c" />}
          />
          <SettingRow
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() => Linking.openURL('https://yoursite.com/terms')}
            right={<Ionicons name="chevron-forward" size={18} color="#8a7a5c" />}
          />
          <SettingRow
            icon="code-slash-outline"
            label="Open Source Licenses"
            onPress={() => Linking.openURL('https://yoursite.com/licenses')}
            right={<Ionicons name="chevron-forward" size={18} color="#8a7a5c" />}
          />
          <SettingRow
            icon="mail-outline"
            label="Contact Us"
            onPress={() => Linking.openURL('mailto:devanlee2nd@gmail.com')}
            right={<Ionicons name="chevron-forward" size={18} color="#8a7a5c" />}
          />
          <SettingRow
            icon="bar-chart-outline"
            label="Analytics Data Collection"
            sub={analyticsOn ? 'Helping improve the app' : 'Disabled'}
            last
            right={
              <Switch
                value={analyticsOn}
                onValueChange={toggleAnalytics}
                trackColor={{ false: '#c8bc9e', true: '#1C3A5C' }}
                thumbColor="#FAF6EC"
              />
            }
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 60 },

  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FAF6EC',
    fontFamily: 'DancingScript_700Bold',
    marginTop: 40,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontStyle: 'italic',
    marginBottom: 24,
    letterSpacing: 0.3,
  },

  proBanner: {
    backgroundColor: 'rgba(187,124,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(187,124,35,0.4)',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  proBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#bb7c23',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6EC',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FAF6EC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c8bc9e',
    marginBottom: 28,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0cc',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowRight: {
    marginLeft: 12,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(28,58,92,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C3A5C',
  },
  rowSub: {
    fontSize: 12,
    color: '#8a7a5c',
    marginTop: 1,
  },

  swatchSection: {
    padding: 18,
  },
  swatchHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8a7a5c',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 16,
  },
  swatchWrap: {
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderColor: '#1C3A5C',
  },
  swatchLocked: {
    opacity: 0.45,
  },
  swatchName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8a7a5c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swatchNameActive: {
    color: '#1C3A5C',
  },
  swatchNameLocked: {
    opacity: 0.4,
  },

  appInfoCard: {
    padding: 20,
  },
  appName: {
    fontFamily: 'DancingScript_700Bold',
    fontSize: 30,
    color: '#1C3A5C',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 13,
    color: '#8a7a5c',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  appInfoDivider: {
    height: 1,
    backgroundColor: '#e8e0cc',
    marginBottom: 14,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  appInfoLabel: {
    fontSize: 13,
    color: '#8a7a5c',
    fontWeight: '600',
  },
  appInfoValue: {
    fontSize: 13,
    color: '#1C3A5C',
    fontWeight: '500',
  },
});
