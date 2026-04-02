import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useThemeColors } from '../theme/colors';

export interface SongItem {
  id: string;
  title: string;
  image: ImageSourcePropType;
}

interface SongRowProps {
  title: string;
  data: SongItem[];
  imageShape?: 'square' | 'circle';
  onSeeAllPress?: () => void;
  onItemPress?: (item: SongItem) => void;
}

const SongRow: React.FC<SongRowProps> = ({ 
  title, 
  data, 
  imageShape = 'square', 
  onSeeAllPress, 
  onItemPress 
}) => {
  const theme = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {data.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.itemContainer}
            onPress={() => onItemPress?.(item)}
          >
            <Image 
              source={item.image} 
              style={[
                styles.image, 
                { backgroundColor: theme.imagePlaceholder },
                imageShape === 'circle' ? styles.circleImage : styles.squareImage
              ]} 
            />
            <Text 
              style={[
                styles.itemTitle,
                { color: theme.text },
                imageShape === 'circle' && styles.centerText,
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
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
  listContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  itemContainer: {
    width: 140,
    marginRight: 16,
  },
  image: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  squareImage: {
    borderRadius: 24,
  },
  circleImage: {
    borderRadius: 70,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  centerText: {
    textAlign: 'center',
  },
});

export default React.memo(SongRow);
