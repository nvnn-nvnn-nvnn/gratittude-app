# Blank White Screen Fix

## Issue

After running `npx expo start --web`, the app loaded to a blank white screen with no visible content and no obvious error overlay. Bundling failed silently from the user's perspective, but the Metro terminal showed:

```
Web Bundling failed
ERROR  Error: Cannot find module 'babel-preset-expo'
```

Every JS file (App.js, screens, navigation) requires Babel to transform JSX before Metro can bundle it. Without `babel-preset-expo`, no files transform → no bundle → nothing for the browser/native runtime to execute → blank white screen.

A secondary, unrelated bug also existed: a stray `w` character in `App.js` after a closing brace, which would have caused a parse error once bundling started working.

## Fix

1. **Installed the missing preset:**
   ```
   npm install --save-dev babel-preset-expo
   ```
   This added it to `devDependencies` in `package.json` and pulled the package into `node_modules`.

2. **Removed the stray `w` typo** in `App.js` inside the notification response listener.

3. **Stripped unused NativeWind wiring** from `babel.config.js`, `metro.config.js`, and the `global.css` import in `App.js`. None of the screens use Tailwind `className` props (every screen uses `StyleSheet.create`), so the NativeWind transform was dead weight that introduced an extra failure surface. The `nativewind`, `tailwindcss`, `global.css`, and `tailwind.config.js` files are still in the repo but no longer wired into the build.

## Why

- `babel-preset-expo` is the Babel preset that teaches Babel how to compile React Native + Expo code (JSX, Flow/TS stripping, RN-specific transforms). Expo's Metro config calls Babel on every source file. When the preset can't be resolved, Babel throws before any code is emitted, so `index.js` never produces a bundle and the runtime has nothing to render — hence a permanent splash/white screen rather than a red error overlay.
- The package was referenced by `babel.config.js` but was never listed in `package.json`, so `npm install` had no reason to fetch it. New Expo projects scaffold it in automatically; in this repo it was missing, likely from a hand-edited `package.json`.
- The stray `w` was a separate parse error that would have surfaced as a red-screen error once the bundle started building. It's fixed now so it doesn't bite next.
- Removing NativeWind from the build is defensible because: (a) no component currently consumes it, (b) `jsxImportSource: "nativewind"` routes every JSX call through NativeWind's runtime, which is an extra moving part to debug, and (c) the configs/files are still on disk if you want to wire it back in later — just reinstall the babel preset entry, restore the metro `withNativeWind` wrapper, and re-import `global.css` in `App.js`.

## How to verify

```
npx expo start --clear
```

The `--clear` flag is important: Metro caches the previous (failed) transform output, and without clearing the cache it can keep serving the stale failure even after the underlying fix.
