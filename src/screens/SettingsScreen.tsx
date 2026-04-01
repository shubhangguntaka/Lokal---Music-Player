import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type AppSettings = {
  autoplayNext: boolean;
  highQualityStreaming: boolean;
  dataSaver: boolean;
  showExplicitContent: boolean;
};

const SETTINGS_KEY = 'lokal_music_settings';

const DEFAULT_SETTINGS: AppSettings = {
  autoplayNext: true,
  highQualityStreaming: true,
  dataSaver: false,
  showExplicitContent: true,
};

const SettingsScreen = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const rawValue = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!rawValue) return;

        const parsed = JSON.parse(rawValue) as Partial<AppSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
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

    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const resetToDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const rows: Array<{ key: keyof AppSettings; title: string; subtitle: string }> = [
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
    <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Ionicons name="refresh" size={14} color={colors.primary} />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {rows.map((row) => (
        <View key={row.key} style={styles.settingRow}>
          <View style={styles.settingTextWrap}>
            <Text style={styles.settingTitle}>{row.title}</Text>
            <Text style={styles.settingSubtitle}>{row.subtitle}</Text>
          </View>
          <Switch
            value={settings[row.key]}
            onValueChange={(value) => updateSetting(row.key, value)}
            trackColor={{ false: '#D4D4D4', true: '#FFC58C' }}
            thumbColor={settings[row.key] ? colors.primary : '#FFFFFF'}
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
    color: colors.primary,
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
});

export default SettingsScreen;
