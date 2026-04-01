import React from 'react';
import {
	Image,
	ImageSourcePropType,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/colors';

export type PlayerTrack = {
	id: string;
	title: string;
	artist: string;
	image: ImageSourcePropType;
	url?: string;
};

type PlayerProps = {
	currentTrack: PlayerTrack;
	isPlaying: boolean;
	onOpen: () => void;
	onTogglePlay: () => void;
	onNext: () => void;
};

const Player: React.FC<PlayerProps> = ({
	currentTrack,
	isPlaying,
	onOpen,
	onTogglePlay,
	onNext,
}) => {
	const theme = useThemeColors();

	return (
		<View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
			<TouchableOpacity
				style={styles.trackPressArea}
				activeOpacity={0.85}
				onPress={onOpen}
			>
				<Image source={currentTrack.image} style={[styles.artwork, { backgroundColor: theme.imagePlaceholder }]} />

				<View style={styles.trackInfo}>
					<Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={1}>
						{currentTrack.title} - {currentTrack.artist}
					</Text>
				</View>
			</TouchableOpacity>

			<View style={styles.controls}>
				<TouchableOpacity style={styles.controlButton} onPress={onTogglePlay}>
					<Ionicons
						name={isPlaying ? 'pause' : 'play'}
						size={30}
						color={theme.primary}
					/>
				</TouchableOpacity>

				<TouchableOpacity style={styles.controlButton} onPress={onNext}>
					<Ionicons name="play-skip-forward" size={30} color={theme.primary} />
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 80,
		borderWidth: 1,
		borderRadius: 18,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	trackPressArea: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	artwork: {
		width: 56,
		height: 56,
		borderRadius: 12,
	},
	trackInfo: {
		flex: 1,
		marginLeft: 12,
		marginRight: 10,
	},
	trackTitle: {
		fontSize: 28 / 2,
		fontWeight: '600',
	},
	controls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	controlButton: {
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
});

export default Player;
