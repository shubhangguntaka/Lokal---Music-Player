import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeStore = {
	themeMode: ThemeMode;
	setThemeMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			themeMode: 'system',
			setThemeMode: (mode) => set({ themeMode: mode }),
		}),
		{
			name: 'lokal-theme-store-v1',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				themeMode: state.themeMode,
			}),
		},
	),
);
