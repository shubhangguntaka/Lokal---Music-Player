import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../theme/colors';

interface SectionHeaderProps {
  title: string;
  onSeeAllPress?: () => void;
  showSeeAll?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  onSeeAllPress,
  showSeeAll = true 
}) => {
  const theme = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {showSeeAll && (
        <TouchableOpacity onPress={onSeeAllPress} disabled={!onSeeAllPress}>
          <Text style={[styles.seeAllText, { color: theme.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SectionHeader;
