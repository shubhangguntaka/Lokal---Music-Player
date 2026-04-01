import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeColors } from '../theme/colors';

interface TabBarProps {
  tabs: string[];
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  const theme = useThemeColors();
  const defaultTab = useMemo(() => {
    if (tabs.includes('Suggested')) {
      return 'Suggested';
    }

    return tabs[0] ?? '';
  }, [tabs]);

  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);
  const currentActiveTab = activeTab ?? internalActiveTab;

  const handleTabPress = (tab: string) => {
    if (activeTab === undefined) {
      setInternalActiveTab(tab);
    }

    onTabPress?.(tab);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}> 
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab) => {
          const isActive = currentActiveTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, isActive && styles.activeTab, isActive && { borderBottomColor: theme.primary }]}
              onPress={() => handleTabPress(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.tabInactive },
                  isActive && styles.activeTabText,
                  isActive && { color: theme.primary },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 32,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
  },
  tabText: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeTabText: {
    fontWeight: '600',
  },
});

export default TabBar;
