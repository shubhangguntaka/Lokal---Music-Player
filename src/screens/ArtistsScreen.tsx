import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	View,
	StyleSheet,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	FlatList,
	ImageSourcePropType,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { PlayerTrack } from '../components/Player';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	formatDuration,
	getArtistName,
	searchSongsByQueries,
	SearchResult,
} from '../services/api';

interface ArtistDetailScreenProps {
	artistId: string;
	artistName: string;
	artistImage: ImageSourcePropType;
	albums: number;
	songs: number;
	totalDuration?: string;
	onPlaySong?: (song: PlayerTrack, queue: PlayerTrack[]) => void;
	onBackPress?: () => void;
}

interface SongItem {
	id: string;
	title: string;
	artist: string;
	image: ImageSourcePropType;
	duration?: string;
	url?: string;
}

const ArtistsScreen: React.FC<ArtistDetailScreenProps> = ({
	artistName = 'Ariana Grande',
	artistImage = require('../../assets/icon.png'),
	albums = 1,
	songs = 20,
	totalDuration = '01:25:43 mins',
	onPlaySong,
	onBackPress,
}) => {
	const [playingSongId, setPlayingSongId] = useState<string | null>(null);
	const [relatedSongs, setRelatedSongs] = useState<SongItem[]>([]);
	const [isLoadingSongs, setIsLoadingSongs] = useState(false);

	useEffect(() => {
		let mounted = true;

		const fetchRelatedSongs = async () => {
			setIsLoadingSongs(true);

			try {
				const queries = [
					`${artistName} songs`,
					`${artistName} hits`,
					`${artistName} popular songs`,
					`${artistName} telugu tamil hindi songs`,
				];

				const results = await searchSongsByQueries(queries, 24);

				if (!mounted) {
					return;
				}

				setRelatedSongs(
					results.map((song: SearchResult) => ({
						id: song.id,
						title: song.title,
						artist: getArtistName(song) || artistName,
						image: { uri: song.image },
						duration: formatDuration(song.duration),
						url: song.url,
					})),
				);
			} catch (error) {
				console.error('Artist related songs fetch error:', error);
			} finally {
				if (mounted) {
					setIsLoadingSongs(false);
				}
			}
		};

		void fetchRelatedSongs();

		return () => {
			mounted = false;
		};
	}, [artistName]);

	const playbackQueue: PlayerTrack[] = useMemo(
		() =>
			relatedSongs
				.filter((song) => Boolean(song.url))
				.map((song) => ({
					id: song.id,
					title: song.title,
					artist: song.artist,
					image: song.image,
					url: song.url,
				})),
		[relatedSongs],
	);

	const renderSongRow = ({ item }: { item: SongItem }) => {
		const isPlaying = playingSongId === item.id;

		return (
			<View style={styles.songRow}>
				<Image source={item.image} style={styles.songImage} />
				<View style={styles.songTextContainer}>
					<Text style={styles.songTitle} numberOfLines={1}>
						{item.title}
					</Text>
					<Text style={styles.songArtist} numberOfLines={1}>
						{item.artist}{item.duration ? ` | ${item.duration}` : ''}
					</Text>
				</View>
				<TouchableOpacity
					style={styles.playButton}
					onPress={() => {
						if (!item.url) return;
						setPlayingSongId(isPlaying ? null : item.id);
						onPlaySong?.(
							{
								id: item.id,
								title: item.title,
								artist: item.artist,
								image: item.image,
								url: item.url,
							},
							playbackQueue,
						);
					}}
				>
					<Ionicons
						name={isPlaying ? 'pause-circle' : 'play-circle'}
						size={36}
						color={colors.primary}
					/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.moreButton}>
					<Feather name="more-vertical" size={20} color="#1A1A1A" />
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={onBackPress}>
					<Ionicons name="chevron-back" size={28} color="#1A1A1A" />
				</TouchableOpacity>
				<View style={styles.headerActions}>
					<TouchableOpacity>
						<Ionicons name="search" size={24} color="#1A1A1A" />
					</TouchableOpacity>
					<TouchableOpacity style={{ marginLeft: 16 }}>
						<Ionicons name="ellipsis-horizontal" size={24} color="#1A1A1A" />
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
				{/* Artist Image */}
				<View style={styles.imageContainer}>
					<Image source={artistImage} style={styles.artistImage} />
				</View>

				{/* Artist Info */}
				<Text style={styles.artistName}>{artistName}</Text>
				<Text style={styles.artistMeta}>
					{albums} Album | {relatedSongs.length || songs} Songs | {totalDuration}
				</Text>

				{/* Action Buttons */}
				<View style={styles.actionContainer}>
					<TouchableOpacity
						style={styles.shuffleButton}
						onPress={() => {
							if (!playbackQueue.length) return;
							const randomIndex = Math.floor(Math.random() * playbackQueue.length);
							onPlaySong?.(playbackQueue[randomIndex], playbackQueue);
						}}
					>
						<Ionicons name="shuffle" size={20} color="#FFFFFF" />
						<Text style={styles.shuffleButtonText}>Shuffle</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.playButton2}
						onPress={() => {
							if (!playbackQueue.length) return;
							onPlaySong?.(playbackQueue[0], playbackQueue);
						}}
					>
						<Ionicons name="play" size={20} color={colors.primary} />
						<Text style={styles.playButtonText}>Play</Text>
					</TouchableOpacity>
				</View>

				{/* Songs Section */}
				<View style={styles.songsSection}>
					<View style={styles.songsSectionHeader}>
						<Text style={styles.songsSectionTitle}>Songs</Text>
						<TouchableOpacity>
							<Text style={styles.seeAllText}>See All</Text>
						</TouchableOpacity>
					</View>

					{isLoadingSongs ? (
						<View style={styles.loadingWrap}>
							<ActivityIndicator size="small" color={colors.primary} />
						</View>
					) : relatedSongs.length === 0 ? (
						<Text style={styles.emptyText}>No related songs found</Text>
					) : (
						<FlatList
							data={relatedSongs}
							renderItem={renderSongRow}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							contentContainerStyle={styles.songsList}
						/>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#ECECEC',
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	content: {
		flex: 1,
	},
	imageContainer: {
		alignItems: 'center',
		paddingVertical: 24,
		paddingHorizontal: 16,
	},
	artistImage: {
		width: 260,
		height: 260,
		borderRadius: 40,
		backgroundColor: '#ECECEC',
	},
	artistName: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1A1A1A',
		textAlign: 'center',
		marginHorizontal: 16,
		marginBottom: 8,
	},
	artistMeta: {
		fontSize: 14,
		color: '#666666',
		textAlign: 'center',
		marginHorizontal: 16,
		marginBottom: 24,
	},
	actionContainer: {
		flexDirection: 'row',
		gap: 12,
		paddingHorizontal: 16,
		marginBottom: 32,
	},
	shuffleButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primary,
		paddingVertical: 14,
		borderRadius: 24,
		gap: 8,
	},
	shuffleButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	playButton2: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFF3E7',
		paddingVertical: 14,
		borderRadius: 24,
		gap: 8,
	},
	playButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.primary,
	},
	songsSection: {
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
	songsSectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	songsSectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1A1A1A',
	},
	seeAllText: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.primary,
	},
	songsList: {
		paddingTop: 8,
	},
	loadingWrap: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 14,
		color: '#777777',
		paddingVertical: 20,
		textAlign: 'center',
	},
	songRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F5F5F5',
	},
	songImage: {
		width: 64,
		height: 64,
		borderRadius: 12,
		backgroundColor: '#ECECEC',
		marginRight: 12,
	},
	songTextContainer: {
		flex: 1,
	},
	songTitle: {
		fontSize: 15,
		fontWeight: '700',
		color: '#1A1A1A',
		marginBottom: 3,
	},
	songArtist: {
		fontSize: 12,
		color: '#999999',
	},
	playButton: {
		marginHorizontal: 8,
	},
	moreButton: {
		padding: 8,
		marginLeft: 4,
	},
});

export default ArtistsScreen;
