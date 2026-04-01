import React, { useState } from 'react';
import {
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

interface AlbumDetailScreenProps {
	albumId: string;
	albumTitle: string;
	albumImage: ImageSourcePropType;
	artist: string;
	year: number;
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
	url?: string;
}

// Sample songs data for album
const sampleSongs: SongItem[] = [
	{
		id: '1',
		title: 'Take My Breath',
		artist: 'The Weeknd',
		image: require('../../assets/icon.png'),
		url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
	},
	{
		id: '2',
		title: 'A Tale by Quincy',
		artist: 'The Weeknd',
		image: require('../../assets/adaptive-icon.png'),
		url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
	},
	{
		id: '3',
		title: 'Out of Time',
		artist: 'The Weeknd',
		image: require('../../assets/splash-icon.png'),
		url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
	},
	{
		id: '4',
		title: 'Starboy',
		artist: 'The Weeknd',
		image: require('../../assets/icon.png'),
		url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
	},
];

const AlbumsScreen: React.FC<AlbumDetailScreenProps> = ({
	albumTitle = 'Dawn FM',
	albumImage = require('../../assets/icon.png'),
	artist = 'The Weeknd',
	year = 2022,
	songs = 16,
	totalDuration = '01:20:38 mins',
	onPlaySong,
	onBackPress,
}) => {
	const [playingSongId, setPlayingSongId] = useState<string | null>(null);

	const playbackQueue: PlayerTrack[] = sampleSongs.map((song) => ({
		id: song.id,
		title: song.title,
		artist: song.artist,
		image: song.image,
		url: song.url,
	}));

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
						{item.artist}
					</Text>
				</View>
				<TouchableOpacity
					style={styles.playButton}
					onPress={() => {
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
				{/* Album Image */}
				<View style={styles.imageContainer}>
					<Image source={albumImage} style={styles.albumImage} />
				</View>

				{/* Album Info */}
				<Text style={styles.albumTitle}>{albumTitle}</Text>
				<Text style={styles.albumMeta}>
					{artist} | {year}
				</Text>
				<Text style={styles.albumStats}>
					{songs} Songs | {totalDuration}
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

					<FlatList
						data={sampleSongs}
						renderItem={renderSongRow}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						contentContainerStyle={styles.songsList}
					/>
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
	albumImage: {
		width: 260,
		height: 260,
		borderRadius: 40,
		backgroundColor: '#ECECEC',
	},
	albumTitle: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1A1A1A',
		textAlign: 'center',
		marginHorizontal: 16,
		marginBottom: 8,
	},
	albumMeta: {
		fontSize: 14,
		color: '#666666',
		textAlign: 'center',
		marginHorizontal: 16,
		marginBottom: 4,
	},
	albumStats: {
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

export default AlbumsScreen;
