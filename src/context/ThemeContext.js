import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const THEMES = [
  { key: 'sky',   color: '#A8C3D8', label: 'Sky',   free: true  },
  { key: 'sage',  color: '#A3BFA8', label: 'Sage',  free: true  },
  { key: 'sand',  color: '#C4B49A', label: 'Sand',  free: true  },
  { key: 'dusk',  color: '#B8A8C8', label: 'Dusk',  free: false },
  { key: 'slate', color: '#8A9BB0', label: 'Slate', free: false },
];

export function ThemeProvider({ children }) {
  const [bgColor, setBgColorState] = useState('#A8C3D8');

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then(saved => {
      if (saved) setBgColorState(saved);
    });
  }, []);

  async function setBgColor(color) {
    setBgColorState(color);
    await AsyncStorage.setItem('app_theme', color);
  }

  return (
    <ThemeContext.Provider value={{ bgColor, setBgColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
