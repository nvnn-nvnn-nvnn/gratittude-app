import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@gratitude_entries';

export async function getEntries() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveEntry(entry) {
  const entries = await getEntries();
  entries.push(entry);
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function clearEntries() {
  await AsyncStorage.removeItem(KEY);
}
