# Writing prompt modal revamp

Reworked `src/screens/GratitudePromptScreen.js` so the modal:

1. Shares an aesthetic with the Home page (sky-blue + cream + navy palette, Dancing Script for the heading) instead of the old dark-navy-on-purple mismatch.
2. Fades and slides into place when it opens, instead of just snapping in.

## Visual changes

- **Background** stayed `#A8C3D8` (sky blue) — same as Home, so the modal feels like a continuation of the page rather than a different screen.
- **Heading** is now Dancing Script at 44pt in white. Reuses the font we already loaded via `@expo-google-fonts/dancing-script` for "Welcome" on Home.
- **Sub-line** is small white italic — a random journaling prompt for new entries, or the original entry's date when editing.
- **Input lives in a "paper" card** — cream `#FAF6EC` with a 1pt black border and soft shadow. Mirrors the journal CTA card on Home, so the modal reads as opening that same piece of paper.
- **Submit button** dropped from purple `#6C63FF` to navy `#1a1a2e` (matching the rest of the dark accents). Pill shape (`borderRadius: 999`) with letter-spacing on the label for a tighter, more confident feel.
- **Close button** is a small translucent-white circle with a `hitSlop` so it's easy to tap without being visually loud.

## The fade-in

```js
const opacity = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(16)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(opacity,    { toValue: 1, duration: 500, useNativeDriver: true }),
    Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
  ]).start();
}, [opacity, translateY]);

return (
  <Animated.View style={[styles.fadeWrap, { opacity, transform: [{ translateY }] }]}>
    {/* heading, paper card, submit button */}
  </Animated.View>
);
```

### Why each piece matters

- **`useRef(new Animated.Value(...))`** — `Animated.Value` is mutable and lives across renders. Using `useRef` avoids re-creating the value each render (which would reset the animation). The `.current` is the value itself.
- **Two values, not one** — opacity makes it appear, translateY (16 → 0) makes it settle up into position. Together they read as a soft rise-in instead of a flat fade.
- **`Animated.parallel(...).start()`** — runs both timings simultaneously. If you wanted them sequenced (fade first, then slide), you'd use `Animated.sequence`.
- **`useNativeDriver: true`** — animation runs on the UI thread instead of crossing the JS bridge every frame. Required for `opacity` and `transform`; would crash for layout properties like `width`/`height`. Pretty much always set this to true for opacity/transform animations.
- **Empty deps in `useEffect`** — runs once on mount. We don't want the animation to re-fire on every state change (typing in the input would re-trigger it otherwise).

### How this composes with the screen-level fade

`src/navigation/index.js` already configures the screen itself to fade in via `presentation: 'transparentModal'` + `animation: 'fade'`. That fade is the whole screen including the sky-blue background. The `Animated.View` fade above runs on top of that, so the user sees:

1. Screen fades in (~250ms, navigation default)
2. Content rises and fades in (500ms, this animation)

The two overlap, which makes the second one feel like a follow-through gesture rather than a second animation. If you turned off one or the other you'd lose the layering — the modal would either pop in starkly or feel laggy on entry.

## Things deliberately not done

- **No spring animation.** A `spring` would bounce, which doesn't match the calm/journal tone. `timing` with the default easing is steadier.
- **No exit animation.** When the user taps the close button, `navigation.goBack()` triggers the screen-level fade-out, which is enough — adding a content-level fade-out would just delay the dismissal.
- **No state-driven animation on save.** The "Submit & earn reward" alert pops up immediately and on dismiss `goBack()` runs. If you ever want a "saved" check-mark animation before dismissing, that's where you'd add another `Animated.Value`.
