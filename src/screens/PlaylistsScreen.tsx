import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
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

const PLAYLIST_ROW_HEIGHT = 88;

const PlaylistsScreen = () => {
    const theme = useThemeColors();
    const playlists = useLibraryStore((state) => state.playlists);
    const createPlaylist = useLibraryStore((state) => state.createPlaylist);
    const removeTrackFromPlaylist = useLibraryStore((state) => state.removeTrackFromPlaylist);
    const playSong = usePlayerStore((state) => state.playSong);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0]?.id || '');

    const selectedPlaylist = useMemo(
        () => playlists.find((playlist) => playlist.id === selectedPlaylistId) || playlists[0],
        [playlists, selectedPlaylistId],
    );

    const playableQueue = useMemo(
        () => selectedPlaylist?.tracks.filter((track) => Boolean(track.url)) || [],
        [selectedPlaylist],
    );

    const keyExtractor = useCallback((item: PlayerTrack) => item.id, []);

    const getItemLayout = useCallback((_: ArrayLike<PlayerTrack> | null | undefined, index: number) => ({
        length: PLAYLIST_ROW_HEIGHT,
        offset: PLAYLIST_ROW_HEIGHT * index,
        index,
    }), []);

    const renderPlaylistItem = useCallback(({ item }: { item: PlayerTrack }) => (
        <View style={[styles.row, { borderBottomColor: theme.border }]}> 
            <Image source={item.image} style={[styles.image, { backgroundColor: theme.imagePlaceholder }]} />
            <View style={styles.textWrap}>
                <Text numberOfLines={1} style={[styles.songTitle, { color: theme.text }]}>{item.title}</Text>
                <Text numberOfLines={1} style={[styles.songArtist, { color: theme.subText }]}>{item.artist}</Text>
            </View>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => item.url && playSong(item, playableQueue.length ? playableQueue : [item])}
                disabled={!item.url}
            >
                <Ionicons name="play-circle" size={34} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => selectedPlaylist && removeTrackFromPlaylist(selectedPlaylist.id, item.id)}
            >
                <Ionicons name="trash-outline" size={22} color={theme.subText} />
            </TouchableOpacity>
        </View>
    ), [playSong, playableQueue, removeTrackFromPlaylist, selectedPlaylist, theme.border, theme.imagePlaceholder, theme.primary, theme.subText, theme.text]);

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}> 
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.text }]}>Playlists</Text>
                <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.primary }]} onPress={() => createPlaylist()}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>New</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.playlistsRow}
            >
                {playlists.map((playlist) => {
                    const isActive = playlist.id === selectedPlaylist?.id;
                    return (
                        <TouchableOpacity
                            key={playlist.id}
                            style={[
                                styles.playlistChip,
                                { backgroundColor: theme.surfaceMuted },
                                isActive && styles.playlistChipActive,
                                isActive && { backgroundColor: theme.softPrimary },
                            ]}
                            onPress={() => setSelectedPlaylistId(playlist.id)}
                        >
                            <Text
                                style={[
                                    styles.playlistChipText,
                                    { color: theme.subText },
                                    isActive && styles.playlistChipTextActive,
                                    isActive && { color: theme.primary },
                                ]}
                            >
                                {playlist.name}
                            </Text>
                            <Text
                                style={[
                                    styles.playlistCount,
                                    { color: theme.mutedText },
                                    isActive && styles.playlistChipTextActive,
                                    isActive && { color: theme.primary },
                                ]}
                            >
                                {playlist.tracks.length}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {!selectedPlaylist || selectedPlaylist.tracks.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Ionicons name="musical-notes-outline" size={52} color={theme.mutedText} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>Playlist is empty</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Add songs from Home, Search, Artist, or Album options.</Text>
                </View>
            ) : (
                <FlatList
                    data={selectedPlaylist.tracks}
                    keyExtractor={keyExtractor}
                    renderItem={renderPlaylistItem}
                    getItemLayout={getItemLayout}
                    removeClippedSubviews
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
                    windowSize={7}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

export default PlaylistsScreen;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 14,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 4,
    },
    createButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    playlistsRow: {
        paddingBottom: 14,
        gap: 8,
    },
    playlistChip: {
        height: 32,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 6,
    },
    playlistChipActive: {
    },
    playlistChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    playlistChipTextActive: {
    },
    playlistCount: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyWrap: {
        flex: 1,
        top: -200,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
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