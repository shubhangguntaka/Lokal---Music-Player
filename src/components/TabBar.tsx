import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

interface TabBarProps {
  tabs: string[];
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
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
    <View style={styles.container}>
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
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Slight border across the entire bar
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
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default TabBar;
