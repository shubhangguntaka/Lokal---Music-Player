import React from 'react';
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PlayerTrack } from '../components/Player';

type NowPlayingScreenProps = {
	track: PlayerTrack;
	isPlaying: boolean;
	positionMillis?: number;
	durationMillis?: number;
	onClose: () => void;
	onTogglePlay: () => void;
	onNext: () => void;
	onPrevious: () => void;
};

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
	track,
	isPlaying,
	positionMillis = 0,
	durationMillis = 0,
	onClose,
	onTogglePlay,
	onNext,
	onPrevious,
}) => {
	const elapsedSeconds = Math.floor(positionMillis / 1000);
	const totalSeconds = Math.floor(durationMillis / 1000);
	const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={onClose} style={styles.headerIconButton}>
					<Ionicons name="chevron-back" size={30} color="#1A1A1A" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.headerIconButton}>
					<Ionicons name="ellipsis-horizontal-circle-outline" size={34} color="#1A1A1A" />
				</TouchableOpacity>
			</View>

			<View style={styles.artworkWrap}>
				<Image source={track.image} style={styles.artwork} />
			</View>

			<Text style={styles.title}>{track.title}</Text>
			<Text style={styles.artist}>{track.artist}</Text>

			<View style={styles.divider} />

			<View style={styles.progressWrap}>
				<View style={styles.progressTrack}>
					<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
					<View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
				</View>
				<View style={styles.timeRow}>
					<Text style={styles.timeText}>{formatTime(elapsedSeconds)}</Text>
					<Text style={styles.timeText}>{formatTime(totalSeconds)}</Text>
				</View>
			</View>

			<View style={styles.mainControls}>
				<TouchableOpacity style={styles.secondaryControl} onPress={onPrevious}>
					<Ionicons name="play-skip-back" size={40} color="#111111" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryControl}>
					<Feather name="rotate-ccw" size={34} color="#111111" />
					<Text style={styles.tenLabel}>10</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.playMain} onPress={onTogglePlay}>
					<Ionicons
						name={isPlaying ? 'pause' : 'play'}
						size={46}
						color="#FFFFFF"
					/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryControl}>
					<Feather name="rotate-cw" size={34} color="#111111" />
					<Text style={styles.tenLabel}>10</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.secondaryControl} onPress={onNext}>
					<Ionicons name="play-skip-forward" size={40} color="#111111" />
				</TouchableOpacity>
			</View>

			<View style={styles.bottomActions}>
				<Ionicons name="speedometer-outline" size={34} color="#111111" />
				<Ionicons name="timer-outline" size={34} color="#111111" />
				<Ionicons name="tv-outline" size={34} color="#111111" />
				<Ionicons name="ellipsis-vertical" size={30} color="#111111" />
			</View>

			<View style={styles.lyricsArea}>
				<Ionicons name="chevron-up" size={28} color="#1A1A1A" />
				<Text style={styles.lyricsText}>Lyrics</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 8,
	},
	headerIconButton: {
		padding: 6,
	},
	artworkWrap: {
		alignItems: 'center',
		marginTop: 20,
	},
	artwork: {
		width: 330,
		height: 330,
		borderRadius: 42,
		backgroundColor: '#ECECEC',
	},
	title: {
		marginTop: 28,
		fontSize: 52 / 2,
		fontWeight: '700',
		color: '#1A1A1A',
		textAlign: 'center',
	},
	artist: {
		marginTop: 8,
		fontSize: 38 / 2,
		fontWeight: '500',
		color: '#2B2B2B',
		textAlign: 'center',
	},
	divider: {
		height: 1,
		backgroundColor: '#ECECEC',
		marginTop: 24,
	},
	progressWrap: {
		marginTop: 20,
	},
	progressTrack: {
		height: 12,
		borderRadius: 6,
		backgroundColor: '#ECECEC',
		overflow: 'visible',
	},
	progressFill: {
		height: 12,
		borderRadius: 6,
		backgroundColor: colors.primary,
	},
	progressThumb: {
		position: 'absolute',
		top: -6,
		width: 24,
		height: 24,
		marginLeft: -12,
		borderRadius: 12,
		backgroundColor: colors.primary,
	},
	timeRow: {
		marginTop: 14,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	timeText: {
		fontSize: 20 / 2,
		fontWeight: '500',
		color: '#222222',
	},
	mainControls: {
		marginTop: 26,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	secondaryControl: {
		width: 52,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	tenLabel: {
		position: 'absolute',
		fontSize: 12,
		fontWeight: '700',
		color: '#111111',
	},
	playMain: {
		width: 94,
		height: 94,
		borderRadius: 47,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bottomActions: {
		marginTop: 30,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	lyricsArea: {
		marginTop: 24,
		alignItems: 'center',
	},
	lyricsText: {
		marginTop: 6,
		fontSize: 22,
		fontWeight: '500',
		color: '#1A1A1A',
	},
});

export default NowPlayingScreen;
