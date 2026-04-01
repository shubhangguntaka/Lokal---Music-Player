import React, { useMemo, useState } from 'react';
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
import { colors } from '../theme/colors';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';

const PlaylistsScreen = () => {
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

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Playlists</Text>
                <TouchableOpacity style={styles.createButton} onPress={() => createPlaylist()}>
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
                            style={[styles.playlistChip, isActive && styles.playlistChipActive]}
                            onPress={() => setSelectedPlaylistId(playlist.id)}
                        >
                            <Text style={[styles.playlistChipText, isActive && styles.playlistChipTextActive]}>
                                {playlist.name}
                            </Text>
                            <Text style={[styles.playlistCount, isActive && styles.playlistChipTextActive]}>
                                {playlist.tracks.length}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {!selectedPlaylist || selectedPlaylist.tracks.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Ionicons name="musical-notes-outline" size={52} color="#B8B8B8" />
                    <Text style={styles.emptyTitle}>Playlist is empty</Text>
                    <Text style={styles.emptySubtitle}>Add songs from Home, Search, Artist, or Album options.</Text>
                </View>
            ) : (
                <FlatList
                    data={selectedPlaylist.tracks}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Image source={item.image} style={styles.image} />
                            <View style={styles.textWrap}>
                                <Text numberOfLines={1} style={styles.songTitle}>{item.title}</Text>
                                <Text numberOfLines={1} style={styles.songArtist}>{item.artist}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => item.url && playSong(item, playableQueue.length ? playableQueue : [item])}
                                disabled={!item.url}
                            >
                                <Ionicons name="play-circle" size={34} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => selectedPlaylist && removeTrackFromPlaylist(selectedPlaylist.id, item.id)}
                            >
                                <Ionicons name="trash-outline" size={22} color="#8E8E8E" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default PlaylistsScreen;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        color: '#1A1A1A',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
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
        backgroundColor: '#F2F2F2',
        gap: 6,
    },
    playlistChipActive: {
        backgroundColor: '#FFF1E2',
    },
    playlistChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
    },
    playlistChipTextActive: {
        color: colors.primary,
    },
    playlistCount: {
        fontSize: 12,
        fontWeight: '700',
        color: '#777777',
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
        color: '#1A1A1A',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6F6F6F',
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
        backgroundColor: '#EAEAEA',
        marginRight: 12,
    },
    textWrap: {
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    songArtist: {
        fontSize: 13,
        color: '#8B8B8B',
    },
    iconButton: {
        paddingHorizontal: 6,
    },
});