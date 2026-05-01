# Editing previous entries

Tapping any past reflection (in History or in Recent reflections on Home) now opens the same modal that's used for new entries, but in **edit mode**: the existing text is pre-filled, the heading reads "Edit reflection," and the submit button reads "Save changes."

## How the pieces fit together

### 1. Storage gained an `id` field

`src/storage/entries.js` previously stored entries as `{ text, date }` and used array index as the only identifier. Index breaks the moment you delete or reorder, so each entry now carries a stable string `id`.

- `generateId()` returns `${Date.now()}_${random suffix}` — collision-resistant for a single-user app, no extra dependency.
- `saveEntry(entry)` now spreads in a generated `id` if one isn't passed.
- `getEntries()` does a one-time **lazy migration**: any entry without an `id` gets one assigned, and the result is written back. Old entries journaled before this change keep working — the first read after the upgrade silently backfills them.
- New helpers: `updateEntry(id, updates)` and `deleteEntry(id)`. Both work by mapping/filtering the in-memory array and writing it back whole. (AsyncStorage is a key/value store, so we always overwrite the full list.)

### 2. The prompt screen learned an "edit mode"

`src/screens/GratitudePromptScreen.js` now reads `route.params?.entry`. If it's there:

- `useState(editingEntry?.text ?? '')` pre-fills the input with the existing text instead of an empty string.
- The header swaps from "Pause & reflect" → "Edit reflection."
- The prompt sub-line shows the original entry's date (e.g. "Tuesday, April 14") instead of a random journaling prompt.
- The submit handler branches: editing calls `updateEntry(id, { text })` and `goBack()` immediately. New entries still go through `saveEntry` and the reward Alert.
- The button label flips between "Save changes" and "Submit & earn reward."

The reward only fires for net-new entries — editing an old reflection shouldn't farm discount codes.

### 3. Past entries are tappable

`HistoryScreen` and `HomeScreen` (the Recent reflections section) wrap each entry card in a `TouchableOpacity` whose `onPress` calls:

```js
navigation.navigate('GratitudePrompt', { entry: item })
```

The same screen is reused — `navigate` with the `entry` param is the only thing that distinguishes the edit flow from the new-entry flow. No extra route registration needed.

### 4. The modal itself

The "fix" to the modal was wiring it to handle the edit case, not changing how it's presented. It still uses the fade-in transition set up earlier in `src/navigation/index.js`:

```js
<Stack.Screen
  name="GratitudePrompt"
  component={GratitudePromptScreen}
  options={{
    presentation: 'transparentModal',
    headerShown: false,
    animation: 'fade',
  }}
/>
```

Because react-navigation passes route params through automatically, opening the screen with or without an `entry` param uses the same animation and screen instance. There's no separate "edit modal" — it's the same modal reading a different prop.

## Why use an `id` instead of `date`?

`date` is set on creation but two entries on the same day would collide if anyone ever edits the date later, and it's also stored as an ISO string that gets serialized back and forth. A dedicated `id` is opaque, immutable, and means update logic doesn't care about the rest of the entry's shape.

## What's not handled yet

- **Delete from the edit screen.** The `deleteEntry` helper exists in storage but isn't wired into the UI. Easiest add: a small "Delete" link in the modal when `isEditing`, with an Alert confirm.
- **Optimistic UI on save.** Right now `updateEntry` writes, then `goBack()` triggers the History/Home `focus` listener to reload. Brief flash of the old text is possible on slow devices. Acceptable for AsyncStorage; revisit if storage moves to a network backend.
- **Edit history / audit trail.** No tracking of "this was edited at X." Add an `updatedAt` field if that becomes useful for the libertarian/privacy story in the scope.
