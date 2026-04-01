import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Alert,
	Animated,
	Easing,
	Image,
	Modal,
	PanResponder,
	Share,
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
import { colors, useThemeColors } from '../theme/colors';
import { PlayerTrack } from '../components/Player';
import OptionsSheetModal, { OptionSheetAction } from '../components/OptionsSheetModal';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';

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
	playbackRate?: number;
	onChangePlaybackRate?: (playbackRate: number) => void;
};

type PlayerOptionsSheet = 'none' | 'speed' | 'timer' | 'track';

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
	playbackRate = 1,
	onChangePlaybackRate,
}) => {
	const theme = useThemeColors();
	const { width } = useWindowDimensions();
	const elapsedSeconds = Math.floor(positionMillis / 1000);
	const totalSeconds = Math.floor(durationMillis / 1000);
	const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;
	const [isScrubbing, setIsScrubbing] = useState(false);
	const [scrubProgress, setScrubProgress] = useState(progress);
	const [showLyrics, setShowLyrics] = useState(false);
	const [isQueueModalVisible, setQueueModalVisible] = useState(false);
	const [sleepTimerLabel, setSleepTimerLabel] = useState<string | null>(null);
	const [isDownloadingCurrentTrack, setDownloadingCurrentTrack] = useState(false);
	const [activeOptionsSheet, setActiveOptionsSheet] = useState<PlayerOptionsSheet>('none');
	const trackWidthRef = useRef(0);
	const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isPlayingRef = useRef(isPlaying);
	const artworkSize = Math.min(width - 34, 340);
	const queue = usePlayerStore((state) => state.queue);
	const currentTrackIndex = usePlayerStore((state) => state.currentTrackIndex);
	const isShuffleEnabled = usePlayerStore((state) => state.isShuffleEnabled);
	const repeatMode = usePlayerStore((state) => state.repeatMode);
	const playQueueIndex = usePlayerStore((state) => state.playQueueIndex);
	const moveQueueItem = usePlayerStore((state) => state.moveQueueItem);
	const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
	const toggleShuffleMode = usePlayerStore((state) => state.toggleShuffleMode);
	const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);
	const downloadTrack = usePlayerStore((state) => state.downloadTrack);
	const removeDownloadedTrack = usePlayerStore((state) => state.removeDownloadedTrack);
	const isTrackDownloaded = usePlayerStore((state) => state.isTrackDownloaded);
	const isFavourite = useLibraryStore((state) => state.isFavourite);
	const toggleFavourite = useLibraryStore((state) => state.toggleFavourite);
	const isCurrentTrackDownloaded = isTrackDownloaded(track.id);
	const isCurrentTrackFavourite = isFavourite(track.id);

	const displayProgress = isScrubbing ? scrubProgress : progress;

	const lyricsLines = useMemo(
		() => [
			`${track.title}`,
			`${track.artist}`,
			'Lost in rhythm, one beat at a time',
			'Let the melody carry the night',
			'Close your eyes and sing along',
			'This moment is yours',
		],
		[track.artist, track.title],
	);

	useEffect(() => {
		if (!isScrubbing) {
			setScrubProgress(progress);
		}
	}, [isScrubbing, progress]);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	useEffect(() => {
		return () => {
			if (sleepTimerRef.current) {
				clearTimeout(sleepTimerRef.current);
				sleepTimerRef.current = null;
			}
		};
	}, []);

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

	const seekBySeconds = (seconds: number) => {
		if (!durationMillis) {
			return;
		}

		const nextPosition = Math.max(
			0,
			Math.min(positionMillis + (seconds * 1000), durationMillis),
		);

		onSeek(nextPosition);
	};

	const clearSleepTimer = () => {
		if (sleepTimerRef.current) {
			clearTimeout(sleepTimerRef.current);
			sleepTimerRef.current = null;
		}
		setSleepTimerLabel(null);
	};

	const startSleepTimer = (minutes: number) => {
		clearSleepTimer();
		setSleepTimerLabel(`${minutes}m`);

		sleepTimerRef.current = setTimeout(() => {
			sleepTimerRef.current = null;
			setSleepTimerLabel(null);

			if (isPlayingRef.current) {
				onTogglePlay();
				Alert.alert('Sleep Timer', 'Playback paused.');
				return;
			}

			Alert.alert('Sleep Timer', 'Timer ended.');
		}, minutes * 60 * 1000);
	};

	const closeOptionsSheet = () => {
		setActiveOptionsSheet('none');
	};

	const openSpeedMenu = () => {
		setActiveOptionsSheet('speed');
	};

	const openSleepTimerMenu = () => {
		setActiveOptionsSheet('timer');
	};

	const handleShareTrack = async () => {
		await Share.share({
			message: `${track.title} - ${track.artist}`,
		});
	};

	const openTrackActions = () => {
		setActiveOptionsSheet('track');
	};

	const toggleFavouriteForCurrentTrack = () => {
		toggleFavourite(track);
	};

	const closeQueuePanel = () => {
		setQueueModalVisible(false);
	};

	const openQueuePanel = () => {
		setQueueModalVisible(true);
	};

	const toggleOfflineForCurrentTrack = async () => {
		if (isDownloadingCurrentTrack) {
			return;
		}

		if (isCurrentTrackDownloaded) {
			await removeDownloadedTrack(track.id);
			Alert.alert('Removed', `${track.title} removed from offline storage.`);
			return;
		}

		if (!track.url) {
			Alert.alert('Download unavailable', 'This track cannot be downloaded right now.');
			return;
		}

		setDownloadingCurrentTrack(true);
		const didDownload = await downloadTrack(track);
		setDownloadingCurrentTrack(false);

		if (!didDownload) {
			Alert.alert('Download failed', 'Unable to save this track for offline playback.');
			return;
		}

		Alert.alert('Downloaded', `${track.title} is available offline.`);
	};

	const speedSheetOptions: OptionSheetAction[] = [0.75, 1, 1.25, 1.5, 2].map((rate) => ({
		key: `speed-${rate}`,
		label: `${rate.toFixed(2)}x${rate === playbackRate ? ' (Current)' : ''}`,
		onPress: () => onChangePlaybackRate?.(rate),
	}));

	const timerSheetOptions: OptionSheetAction[] = [
		{ key: 'timer-5', label: '5 min', onPress: () => startSleepTimer(5) },
		{ key: 'timer-10', label: '10 min', onPress: () => startSleepTimer(10) },
		{ key: 'timer-15', label: '15 min', onPress: () => startSleepTimer(15) },
		{ key: 'timer-30', label: '30 min', onPress: () => startSleepTimer(30) },
		{ key: 'timer-off', label: 'Turn Off', onPress: clearSleepTimer },
	];

	const trackSheetOptions: OptionSheetAction[] = [
		{ key: 'share', label: 'Share', onPress: () => void handleShareTrack() },
		{
			key: 'queue-open',
			label: `Show Queue (${queue.length})`,
			onPress: openQueuePanel,
		},
		{
			key: 'offline-toggle',
			label: isCurrentTrackDownloaded
				? 'Remove Download'
				: isDownloadingCurrentTrack
					? 'Downloading...'
					: 'Download for Offline',
			onPress: () => {
				void toggleOfflineForCurrentTrack();
			},
		},
		{
			key: 'details',
			label: 'Details',
			onPress: () => {
				Alert.alert(
					'Track Details',
					`${track.title}\n${track.artist}\n${formatTime(elapsedSeconds)} / ${formatTime(totalSeconds)}\nSpeed: ${playbackRate.toFixed(2)}x`,
				);
			},
		},
		{
			key: 'lyrics-toggle',
			label: showLyrics ? 'Hide Lyrics' : 'Show Lyrics',
			onPress: () => setShowLyrics((prev) => !prev),
		},
	];

	const activeSheetOptions =
		activeOptionsSheet === 'speed'
			? speedSheetOptions
			: activeOptionsSheet === 'timer'
				? timerSheetOptions
				: trackSheetOptions;

	const activeSheetTitle =
		activeOptionsSheet === 'speed'
			? 'Playback Speed'
			: activeOptionsSheet === 'timer'
				? 'Sleep Timer'
				: track.title;

	const activeSheetSubtitle =
		activeOptionsSheet === 'speed'
			? `Current: ${playbackRate.toFixed(2)}x`
			: activeOptionsSheet === 'timer'
				? sleepTimerLabel ? `Active: ${sleepTimerLabel}` : 'Choose timer duration'
				: track.artist;

	const repeatModeLabel =
		repeatMode === 'off'
			? 'Rpt Off'
			: repeatMode === 'all'
				? 'Rpt All'
				: 'Rpt 1';

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
			<ScrollView
				scrollEnabled={!isScrubbing}
				bounces={false}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.artworkWrap}>
					<Image
						source={track.image}
						style={[
							styles.artwork,
							{ width: artworkSize, height: artworkSize, backgroundColor: theme.imagePlaceholder },
						]}
					/>
				</View>

				<View style={styles.titleRow}>
					<MarqueeText
						text={track.title}
						textStyle={[styles.title, { color: theme.text }]}
						containerStyle={styles.titleWrap}
					/>
					<TouchableOpacity
						style={styles.titleActionButton}
						onPress={toggleFavouriteForCurrentTrack}
					>
						<Ionicons
							name={isCurrentTrackFavourite ? 'heart' : 'heart-outline'}
							size={28}
							color={isCurrentTrackFavourite ? theme.primary : theme.icon}
						/>
					</TouchableOpacity>
				</View>
				<MarqueeText
					text={track.artist}
					textStyle={[styles.artist, { color: theme.subText }]}
					containerStyle={styles.artistWrap}
				/>

				<View style={[styles.divider, { backgroundColor: theme.border }]} />

				<View style={styles.progressWrap}>
					<View
						style={styles.progressTrack}
						onLayout={(event) => {
							trackWidthRef.current = event.nativeEvent.layout.width;
						}}
						{...panResponder.panHandlers}
					>
						<View style={[styles.progressFill, { width: `${displayProgress * 100}%`, backgroundColor: theme.primary }]} />
						<View style={[styles.progressThumb, { left: `${displayProgress * 100}%`, backgroundColor: theme.primary }]} />
					</View>
					<View style={styles.timeRow}>
						<Text style={[styles.timeText, { color: theme.text }]}> 
							{formatTime(isScrubbing ? Math.floor((scrubProgress * durationMillis) / 1000) : elapsedSeconds)}
						</Text>
						<Text style={[styles.timeText, { color: theme.text }]}>{formatTime(totalSeconds)}</Text>
					</View>
				</View>

				<View style={styles.mainControls}>
					<TouchableOpacity style={styles.secondaryControl} onPress={onPrevious}>
						<Ionicons name="play-skip-back" size={40} color={theme.icon} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.secondaryControl} onPress={() => seekBySeconds(-10)}>
						<Feather name="rotate-ccw" size={34} color={theme.icon} />
						<Text style={[styles.tenLabel, { color: theme.icon }]}>10</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.playMain, { backgroundColor: theme.primary }]} onPress={onTogglePlay}>
						<Ionicons
							name={isPlaying ? 'pause' : 'play'}
							size={46}
							color="#FFFFFF"
						/>
					</TouchableOpacity>
					<TouchableOpacity style={styles.secondaryControl} onPress={() => seekBySeconds(10)}>
						<Feather name="rotate-cw" size={34} color={theme.icon} />
						<Text style={[styles.tenLabel, { color: theme.icon }]}>10</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.secondaryControl} onPress={onNext}>
						<Ionicons name="play-skip-forward" size={40} color={theme.icon} />
					</TouchableOpacity>
				</View>

				<View style={styles.bottomActions}>
					<TouchableOpacity style={styles.bottomActionButton} onPress={openSpeedMenu}>
						<Ionicons name="speedometer-outline" size={28} color={theme.icon} />
						<Text style={[styles.bottomActionLabel, { color: theme.subText }]}>{playbackRate.toFixed(2)}x</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.bottomActionButton} onPress={openSleepTimerMenu}>
						<Ionicons name="timer-outline" size={28} color={theme.icon} />
						<Text style={[styles.bottomActionLabel, { color: theme.subText }]}>{sleepTimerLabel || 'Timer'}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.bottomActionButton} onPress={openQueuePanel}>
						<Ionicons name="list-outline" size={28} color={theme.icon} />
						<Text style={[styles.bottomActionLabel, { color: theme.subText }]}>Queue</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.bottomActionButton}
						onPress={toggleShuffleMode}
					>
						<Ionicons
							name="shuffle"
							size={28}
							color={isShuffleEnabled ? theme.primary : theme.icon}
						/>
						<Text style={[styles.bottomActionLabel, { color: theme.subText }]}>{isShuffleEnabled ? 'Shuffle On' : 'Shuffle'}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.bottomActionButton} onPress={cycleRepeatMode}>
						<Ionicons
							name="repeat"
							size={26}
							color={repeatMode !== 'off' ? theme.primary : theme.icon}
						/>
						<Text style={[styles.bottomActionLabel, { color: theme.subText }]}>{repeatModeLabel}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.bottomActionButton} onPress={openTrackActions}>
						<Ionicons name="ellipsis-vertical" size={26} color={theme.icon} />
						<Text style={[styles.bottomActionLabel, { color: theme.subText }]}>More</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					style={styles.lyricsArea}
					onPress={() => setShowLyrics((prev) => !prev)}
				>
					<Ionicons name={showLyrics ? 'chevron-down' : 'chevron-up'} size={28} color={theme.icon} />
					<Text style={[styles.lyricsText, { color: theme.text }]}>{showLyrics ? 'Hide Lyrics' : 'Lyrics'}</Text>
				</TouchableOpacity>

				{showLyrics && (
					<View style={[styles.lyricsPanel, { backgroundColor: theme.surface }]}> 
						{lyricsLines.map((line, index) => (
							<Text
								key={`${track.id}-${index}`}
								style={
									index === 0
										? [styles.lyricsLineActive, { color: theme.text }]
										: [styles.lyricsLine, { color: theme.subText }]
								}
							>
								{line}
							</Text>
						))}
					</View>
				)}
			</ScrollView>

			<Modal
				visible={isQueueModalVisible}
				transparent
				animationType="slide"
				onRequestClose={closeQueuePanel}
			>
				<TouchableOpacity
					style={[styles.queueModalOverlay, { backgroundColor: theme.overlay }]}
					activeOpacity={1}
					onPress={closeQueuePanel}
				>
					<TouchableOpacity
						activeOpacity={1}
						style={[styles.queueSheet, { backgroundColor: theme.surface }]}
						onPress={() => undefined}
					>
						<View style={styles.queueSheetHeader}>
							<Text style={[styles.queueSheetTitle, { color: theme.text }]}>Queue ({queue.length})</Text>
							<TouchableOpacity onPress={closeQueuePanel}>
								<Ionicons name="close" size={24} color={theme.icon} />
							</TouchableOpacity>
						</View>
						<Text style={[styles.queueSheetSubtitle, { color: theme.subText }]}>Queue is stored locally.</Text>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.queueListContent}>
							{queue.length === 0 ? (
								<Text style={styles.queueEmptyText}>Queue is empty.</Text>
							) : (
								queue.map((queueTrack, index) => {
									const isCurrentQueueTrack = index === currentTrackIndex;

									return (
										<View
											key={`${queueTrack.id}-${index}`}
											style={[
												styles.queueRow,
												{ borderTopColor: theme.border },
												isCurrentQueueTrack && styles.queueRowActive,
												isCurrentQueueTrack && { backgroundColor: theme.softPrimary },
											]}
										>
											<TouchableOpacity
												style={styles.queueTrackInfo}
												onPress={() => {
													playQueueIndex(index);
													closeQueuePanel();
												}}
											>
												<Image source={queueTrack.image} style={[styles.queueTrackImage, { backgroundColor: theme.imagePlaceholder }]} />
												<View style={styles.queueTextWrap}>
													<Text numberOfLines={1} style={[styles.queueTrackTitle, { color: theme.text }]}>
														{queueTrack.title}
													</Text>
													<Text numberOfLines={1} style={[styles.queueTrackArtist, { color: theme.subText }]}>
														{queueTrack.artist}
													</Text>
												</View>
											</TouchableOpacity>

											<View style={styles.queueControls}>
												<TouchableOpacity
													disabled={index === 0}
													onPress={() => moveQueueItem(index, Math.max(index - 1, 0))}
												>
													<Ionicons
														name="chevron-up"
														size={20}
														color={index === 0 ? theme.mutedText : theme.icon}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													disabled={index === queue.length - 1}
													onPress={() => moveQueueItem(index, Math.min(index + 1, queue.length - 1))}
												>
													<Ionicons
														name="chevron-down"
														size={20}
														color={index === queue.length - 1 ? theme.mutedText : theme.icon}
													/>
												</TouchableOpacity>
												<TouchableOpacity onPress={() => removeFromQueue(queueTrack.id)}>
													<Ionicons name="trash-outline" size={18} color={theme.danger} />
												</TouchableOpacity>
											</View>
										</View>
									);
								})
							)}
						</ScrollView>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>

			<OptionsSheetModal
				visible={activeOptionsSheet !== 'none'}
				onClose={closeOptionsSheet}
				title={activeSheetTitle}
				subtitle={activeSheetSubtitle}
				image={activeOptionsSheet === 'track' ? track.image : undefined}
				options={activeSheetOptions}
			/>
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
		width: undefined,
		flex: 1,
		minHeight: 34,
	},
	titleRow: {
		marginTop: 24,
		minHeight: 34,
		flexDirection: 'row',
		alignItems: 'center',
	},
	titleActionButton: {
		marginLeft: 8,
		padding: 2,
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
		marginTop: 10,
		paddingHorizontal: 4,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	bottomActionButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 4,
	},
	bottomActionLabel: {
		marginTop: 3,
		fontSize: 10,
		fontWeight: '600',
		color: '#2A2A2A',
	},
	queueModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.48)',
		justifyContent: 'flex-end',
	},
	queueSheet: {
		maxHeight: '78%',
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 10,
	},
	queueSheetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	queueSheetTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1A1A1A',
	},
	queueSheetSubtitle: {
		fontSize: 12,
		color: '#7A7A7A',
		marginBottom: 8,
	},
	queueListContent: {
		paddingBottom: 24,
	},
	queueEmptyText: {
		fontSize: 13,
		color: '#757575',
		paddingVertical: 12,
		textAlign: 'center',
	},
	queueRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		borderTopWidth: 1,
		borderTopColor: '#F1F1F1',
	},
	queueRowActive: {
		backgroundColor: '#FFF3E6',
		borderRadius: 10,
		paddingHorizontal: 6,
	},
	queueTrackInfo: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	queueTrackImage: {
		width: 44,
		height: 44,
		borderRadius: 10,
		backgroundColor: '#ECECEC',
		marginRight: 10,
	},
	queueTextWrap: {
		flex: 1,
	},
	queueTrackTitle: {
		fontSize: 13,
		fontWeight: '700',
		color: '#1E1E1E',
	},
	queueTrackArtist: {
		fontSize: 11,
		color: '#7A7A7A',
		marginTop: 2,
	},
	queueControls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginLeft: 8,
	},
	lyricsArea: {
		marginTop: 10,
		alignItems: 'center',
	},
	lyricsText: {
		fontSize: 22,
		fontWeight: '500',
		color: '#1A1A1A',
	},
	lyricsPanel: {
		marginTop: 14,
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		paddingVertical: 14,
		paddingHorizontal: 14,
		gap: 8,
	},
	lyricsLine: {
		fontSize: 16,
		lineHeight: 24,
		color: '#555555',
		textAlign: 'center',
	},
	lyricsLineActive: {
		fontSize: 18,
		lineHeight: 26,
		color: '#1A1A1A',
		fontWeight: '700',
		textAlign: 'center',
	},
});

export default NowPlayingScreen;
