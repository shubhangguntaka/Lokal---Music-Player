import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	Easing,
	Image,
	PanResponder,
	ScrollView,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	TouchableOpacity,
	useWindowDimensions,
	ViewStyle,
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
	onSeek: (positionMillis: number) => void;
};

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

type MarqueeTextProps = {
	text: string;
	textStyle: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
};

const MarqueeText: React.FC<MarqueeTextProps> = ({ text, textStyle, containerStyle }) => {
	const [containerWidth, setContainerWidth] = useState(0);
	const [textWidth, setTextWidth] = useState(0);
	const translateX = useRef(new Animated.Value(0)).current;

	const shouldAnimate = containerWidth > 0 && textWidth > containerWidth;

	useEffect(() => {
		translateX.stopAnimation();

		if (!shouldAnimate) {
			translateX.setValue(0);
			return;
		}

		const travelDistance = textWidth - containerWidth + 24;
		const duration = Math.max(4500, travelDistance * 30);

		const animation = Animated.loop(
			Animated.sequence([
				Animated.delay(700),
				Animated.timing(translateX, {
					toValue: -travelDistance,
					duration,
					easing: Easing.linear,
					useNativeDriver: true,
				}),
				Animated.delay(450),
				Animated.timing(translateX, {
					toValue: 0,
					duration: 0,
					useNativeDriver: true,
				}),
				Animated.delay(650),
			]),
		);

		animation.start();

		return () => {
			animation.stop();
			translateX.setValue(0);
		};
	}, [containerWidth, shouldAnimate, text, textWidth, translateX]);

	return (
		<View
			style={[styles.marqueeContainer, containerStyle]}
			onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
		>
			{shouldAnimate ? (
				<Animated.Text
					numberOfLines={1}
					onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}
					style={[textStyle, styles.marqueeAnimatedText, { transform: [{ translateX }] }]}
				>
					{text}
				</Animated.Text>
			) : (
				<Text
					numberOfLines={1}
					onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}
					style={[textStyle, styles.marqueeStaticText]}
				>
					{text}
				</Text>
			)}
		</View>
	);
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
	onSeek,
}) => {
	const { width } = useWindowDimensions();
	const elapsedSeconds = Math.floor(positionMillis / 1000);
	const totalSeconds = Math.floor(durationMillis / 1000);
	const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;
	const [isScrubbing, setIsScrubbing] = useState(false);
	const [scrubProgress, setScrubProgress] = useState(progress);
	const trackWidthRef = useRef(0);
 	const artworkSize = Math.min(width - 34, 340);

	const displayProgress = isScrubbing ? scrubProgress : progress;

	const updateScrub = (locationX: number) => {
		const trackWidth = trackWidthRef.current;
		if (!trackWidth) return 0;

		const nextProgress = Math.max(0, Math.min(locationX / trackWidth, 1));
		setScrubProgress(nextProgress);
		return nextProgress;
	};

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				onPanResponderGrant: (event) => {
					setIsScrubbing(true);
					updateScrub(event.nativeEvent.locationX);
				},
				onPanResponderMove: (event) => {
					updateScrub(event.nativeEvent.locationX);
				},
				onPanResponderRelease: (event) => {
					if (!durationMillis) {
						setIsScrubbing(false);
						return;
					}

					const nextProgress = updateScrub(event.nativeEvent.locationX);
					setIsScrubbing(false);
					onSeek(Math.floor(nextProgress * durationMillis));
				},
				onPanResponderTerminate: (event) => {
					if (!durationMillis) {
						setIsScrubbing(false);
						return;
					}

					const nextProgress = updateScrub(event.nativeEvent.locationX);
					setIsScrubbing(false);
					onSeek(Math.floor(nextProgress * durationMillis));
				},
			}),
		[durationMillis, onSeek],
	);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				scrollEnabled={!isScrubbing}
				bounces={false}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={onClose} style={styles.headerIconButton}>
						<Ionicons name="chevron-back" size={30} color="#1A1A1A" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.headerIconButton}>
						<Ionicons name="ellipsis-horizontal-circle-outline" size={34} color="#1A1A1A" />
					</TouchableOpacity>
				</View>

				<View style={styles.artworkWrap}>
					<Image source={track.image} style={[styles.artwork, { width: artworkSize, height: artworkSize }]} />
				</View>

				<MarqueeText text={track.title} textStyle={styles.title} containerStyle={styles.titleWrap} />
				<MarqueeText text={track.artist} textStyle={styles.artist} containerStyle={styles.artistWrap} />

				<View style={styles.divider} />

				<View style={styles.progressWrap}>
					<View
						style={styles.progressTrack}
						onLayout={(event) => {
							trackWidthRef.current = event.nativeEvent.layout.width;
						}}
						{...panResponder.panHandlers}
					>
						<View style={[styles.progressFill, { width: `${displayProgress * 100}%` }]} />
						<View style={[styles.progressThumb, { left: `${displayProgress * 100}%` }]} />
					</View>
					<View style={styles.timeRow}>
						<Text style={styles.timeText}>
							{formatTime(isScrubbing ? Math.floor((scrubProgress * durationMillis) / 1000) : elapsedSeconds)}
						</Text>
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
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F5F5',
		paddingHorizontal: 17,
	},
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 34,
		paddingTop: 2,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 4,
		paddingBottom: 8,
	},
	headerIconButton: {
		padding: 5,
	},
	artworkWrap: {
		alignItems: 'center',
		marginTop: 18,
	},
	artwork: {
		borderRadius: 40,
		backgroundColor: '#ECECEC',
	},
	titleWrap: {
		marginTop: 24,
		minHeight: 34,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1A1A1A',
		textAlign: 'center',
	},
	artistWrap: {
		marginTop: 8,
		minHeight: 24,
	},
	artist: {
		fontSize: 18,
		fontWeight: '500',
		color: '#3A3A3A',
		textAlign: 'center',
	},
	marqueeContainer: {
		width: '100%',
		overflow: 'hidden',
	},
	marqueeStaticText: {
		textAlign: 'center',
	},
	marqueeAnimatedText: {
		textAlign: 'left',
		paddingRight: 24,
	},
	divider: {
		height: 1,
		backgroundColor: '#E6E6E6',
		marginTop: 22,
	},
	progressWrap: {
		marginTop: 18,
	},
	progressTrack: {
		height: 14,
		borderRadius: 7,
		backgroundColor: '#E3E3E3',
		overflow: 'visible',
	},
	progressFill: {
		height: 14,
		borderRadius: 7,
		backgroundColor: colors.primary,
	},
	progressThumb: {
		position: 'absolute',
		top: -7,
		width: 28,
		height: 28,
		marginLeft: -14,
		borderRadius: 14,
		backgroundColor: colors.primary,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	timeRow: {
		marginTop: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	timeText: {
		fontSize: 17,
		fontWeight: '500',
		color: '#1F1F1F',
	},
	mainControls: {
		marginTop: 24,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	secondaryControl: {
		width: 56,
		height: 56,
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
		shadowColor: '#FF7A00',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.35,
		shadowRadius: 10,
		elevation: 6,
	},
	bottomActions: {
		marginTop: 28,
		paddingHorizontal: 14,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	lyricsArea: {
		marginTop: 26,
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
