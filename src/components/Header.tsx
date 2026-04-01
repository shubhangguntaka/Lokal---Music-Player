import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface HeaderProps {
  onSearchPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchPress }) => {
  return (
    <View style={styles.container}>
      {/* Target Logo Section */}
      <View style={styles.logoContainer}>
        <Ionicons name="musical-notes" size={28} color={colors.primary} />
        <Text style={styles.logoText}>Mume</Text>
      </View>

      {/* Target Search Icon */}
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
        <Feather name="search" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.5,
  },
  searchButton: {
    padding: 4,
  },
});

export default Header;
