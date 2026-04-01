// theme/colors.ts
import { useColorScheme } from 'react-native';
import { ThemeMode, useThemeStore } from '../store/themeStore';

export type ThemeColors = {
  primary: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  card: string;
  text: string;
  subText: string;
  mutedText: string;
  border: string;
  icon: string;
  inputBackground: string;
  softPrimary: string;
  overlay: string;
  overlayLight: string;
  handle: string;
  danger: string;
  tabInactive: string;
  switchTrackOff: string;
  switchTrackOn: string;
  imagePlaceholder: string;
};

export const lightColors: ThemeColors = {
  primary: '#FF7A00',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  subText: '#707070',
  mutedText: '#999999',
  border: '#ECECEC',
  icon: '#1A1A1A',
  inputBackground: '#F4F4F4',
  softPrimary: '#FFF1E2',
  overlay: 'rgba(0,0,0,0.48)',
  overlayLight: 'rgba(0,0,0,0.12)',
  handle: '#DDDDDD',
  danger: '#D92D20',
  tabInactive: '#9A9A9A',
  switchTrackOff: '#D4D4D4',
  switchTrackOn: '#FFC58C',
  imagePlaceholder: '#ECECEC',
};

export const darkColors: ThemeColors = {
  primary: '#FF8A1A',
  background: '#0D1220',
  surface: '#141C30',
  surfaceMuted: '#1C2640',
  card: '#1A2238',
  text: '#F5F7FF',
  subText: '#A7B0C7',
  mutedText: '#7D89A6',
  border: '#2A3550',
  icon: '#F5F7FF',
  inputBackground: '#1A2339',
  softPrimary: '#3A2B1A',
  overlay: 'rgba(4,8,18,0.78)',
  overlayLight: 'rgba(4,8,18,0.42)',
  handle: '#4B5570',
  danger: '#FF6B61',
  tabInactive: '#7B86A4',
  switchTrackOff: '#4A536B',
  switchTrackOn: '#7A5732',
  imagePlaceholder: '#2B3754',
};

// Backward-compatible fallback for static imports.
export const colors = lightColors;

const resolveThemeMode = (themeMode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): 'light' | 'dark' => {
  if (themeMode === 'light' || themeMode === 'dark') {
    return themeMode;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
};

export const useResolvedThemeMode = (): 'light' | 'dark' => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const systemScheme = useColorScheme();

  return resolveThemeMode(themeMode, systemScheme);
};

export const useIsDarkTheme = (): boolean => {
  return useResolvedThemeMode() === 'dark';
};

export const useThemeColors = (): ThemeColors => {
  return useIsDarkTheme() ? darkColors : lightColors;
};