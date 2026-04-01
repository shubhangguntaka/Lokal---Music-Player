import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/colors';
import { ThemeMode, useThemeStore } from '../store/themeStore';

type AppSettings = {
  themeMode: ThemeMode;
  autoplayNext: boolean;
  highQualityStreaming: boolean;
  dataSaver: boolean;
  showExplicitContent: boolean;
};

type ToggleSettingKey = Exclude<keyof AppSettings, 'themeMode'>;

const SETTINGS_KEY = 'lokal_music_settings';

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  autoplayNext: true,
  highQualityStreaming: true,
  dataSaver: false,
  showExplicitContent: true,
};

type LegacySettings = Partial<AppSettings> & {
  darkMode?: boolean;
};

const THEME_MODE_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: 'system', label: 'Same as System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const SettingsScreen = () => {
  const theme = useThemeColors();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const rawValue = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!rawValue) return;

        const parsed = JSON.parse(rawValue) as LegacySettings;
        const normalizedThemeMode: ThemeMode =
          parsed.themeMode ||
          (typeof parsed.darkMode === 'boolean' ? (parsed.darkMode ? 'dark' : 'light') : DEFAULT_SETTINGS.themeMode);

        const merged: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          themeMode: normalizedThemeMode,
        };

        setSettings(merged);
        setThemeMode(merged.themeMode);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    void loadSettings();
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);

    if (key === 'themeMode') {
      setThemeMode(value as ThemeMode);
    }

    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const resetToDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    setThemeMode(DEFAULT_SETTINGS.themeMode);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const rows: Array<{ key: ToggleSettingKey; title: string; subtitle: string }> = [
    {
      key: 'autoplayNext',
      title: 'Autoplay Next Track',
      subtitle: 'Automatically play the next song in queue.',
    },
    {
      key: 'highQualityStreaming',
      title: 'High Quality Streaming',
      subtitle: 'Use higher bitrate audio when available.',
    },
    {
      key: 'dataSaver',
      title: 'Data Saver Mode',
      subtitle: 'Reduce bandwidth by preferring lower quality streams.',
    },
    {
      key: 'showExplicitContent',
      title: 'Show Explicit Content',
      subtitle: 'Allow explicit songs in lists and search results.',
    },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}> 
      <View style={styles.content}>
        <View style={[styles.headerRow, { borderBottomColor: theme.border }]}> 
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <TouchableOpacity style={[styles.resetButton, { backgroundColor: theme.softPrimary }]} onPress={resetToDefaults}>
            <Ionicons name="refresh" size={14} color={theme.primary} />
            <Text style={[styles.resetButtonText, { color: theme.primary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.border, alignItems: 'flex-start' }]}> 
          <View style={styles.settingTextWrap}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Appearance</Text>
            <Text style={[styles.settingSubtitle, { color: theme.subText }]}>Choose Same as System, Light, or Dark mode.</Text>
          </View>
          <View style={styles.themeModeOptionsWrap}>
            {THEME_MODE_OPTIONS.map((option) => {
              const isSelected = settings.themeMode === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeModeOption,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.softPrimary : theme.surface,
                    },
                  ]}
                  onPress={() => void updateSetting('themeMode', option.value)}
                >
                  <Text
                    style={[
                      styles.themeModeOptionText,
                      { color: isSelected ? theme.primary : theme.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {rows.map((row) => (
          <View key={row.key} style={[styles.settingRow, { borderBottomColor: theme.border }]}> 
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>{row.title}</Text>
              <Text style={[styles.settingSubtitle, { color: theme.subText }]}>{row.subtitle}</Text>
            </View>
            <Switch
              value={settings[row.key]}
              onValueChange={(value) => updateSetting(row.key, value)}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={settings[row.key] ? theme.primary : '#FFFFFF'}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1E2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingVertical: 14,
    gap: 10,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#707070',
  },
  themeModeOptionsWrap: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  themeModeOption: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  themeModeOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SettingsScreen;
