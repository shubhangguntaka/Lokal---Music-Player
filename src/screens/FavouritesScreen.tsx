import React, { useMemo } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/colors';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { PlayerTrack } from '../components/Player';

const FavouritesScreen = () => {
    const theme = useThemeColors();
    const favourites = useLibraryStore((state) => state.favourites);
    const removeFromFavourites = useLibraryStore((state) => state.removeFromFavourites);
    const playSong = usePlayerStore((state) => state.playSong);

    const playableQueue = useMemo(
        () => favourites.filter((track) => Boolean(track.url)),
        [favourites],
    );

    const handlePlayTrack = (track: PlayerTrack) => {
        if (!track.url) return;
        playSong(track, playableQueue.length ? playableQueue : [track]);
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Favourites</Text>

            {favourites.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Ionicons name="heart-outline" size={54} color={theme.mutedText} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No favourite songs yet</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.subText }]}> 
                        Tap the heart action in songs to save tracks here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favourites}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={[styles.row, { borderBottomColor: theme.border }]}> 
                            <Image source={item.image} style={[styles.image, { backgroundColor: theme.imagePlaceholder }]} />
                            <View style={styles.textWrap}>
                                <Text numberOfLines={1} style={[styles.songTitle, { color: theme.text }]}>{item.title}</Text>
                                <Text numberOfLines={1} style={[styles.songArtist, { color: theme.subText }]}>{item.artist}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => handlePlayTrack(item)}
                                disabled={!item.url}
                            >
                                <Ionicons name="play-circle" size={34} color={theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => removeFromFavourites(item.id)}
                            >
                                <Ionicons name="heart" size={24} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default FavouritesScreen;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 14,
    },
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 16,
        marginRight: 12,
    },
    textWrap: {
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    songArtist: {
        fontSize: 13,
    },
    iconButton: {
        paddingHorizontal: 6,
    },
});