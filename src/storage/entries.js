import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@gratitude_entries';

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}



function normalizeDate(d) {
  return new Date(d).toISOString().split('T')[0];
}

export async function getEntries() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw);
    let dirty = false;
    const normalized = entries.map(e => {
      if (!e.id) {
        dirty = true;
        return { ...e, id: generateId() };
      }
      return e;
    });
    if (dirty) {
      await AsyncStorage.setItem(KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return [];
  }
}

export async function saveEntry(entry) {
  const entries = await getEntries();
  const day = normalizeDate(entry.date);


  if (entries.some(e => normalizeDate(e.date) === day)) {
    throw new Error('ENTRY_EXISTS_FOR_DATE');
  }


  entries.push({ id: generateId(), ...entry });
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function updateEntry(id, updates) {
  const entries = await getEntries();
  const next = entries.map(e => (e.id === id ? { ...e, ...updates } : e));
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function deleteEntry(id) {
  const entries = await getEntries();
  const next = entries.filter(e => e.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearEntries() {
  await AsyncStorage.removeItem(KEY);
}
