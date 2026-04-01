import { Audio, AVPlaybackStatus } from 'expo-av';

let sound: Audio.Sound | null = null;

type PlaybackStatusSnapshot = {
	positionMillis: number;
	durationMillis: number;
	isPlaying: boolean;
};

let playbackStatusListener: ((status: PlaybackStatusSnapshot) => void) | null = null;

const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
	if (!status.isLoaded) return;

	playbackStatusListener?.({
		positionMillis: status.positionMillis ?? 0,
		durationMillis: status.durationMillis ?? 0,
		isPlaying: status.isPlaying ?? false,
	});
};

export const setPlaybackStatusListener = (
	listener: ((status: PlaybackStatusSnapshot) => void) | null,
) => {
	playbackStatusListener = listener;
	if (sound) {
		sound.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
	}
};

const ensureAudioMode = async () => {
	await Audio.setAudioModeAsync({
		staysActiveInBackground: false,
		playsInSilentModeIOS: true,
		shouldDuckAndroid: true,
		playThroughEarpieceAndroid: false,
	});
};

export const playSongFromUrl = async (url: string) => {
	await ensureAudioMode();

	if (sound) {
		await sound.unloadAsync();
		sound = null;
	}

	sound = new Audio.Sound();
	sound.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);
	await sound.loadAsync({ uri: url });
	await sound.playAsync();
};

export const pauseSong = async () => {
	if (!sound) return;
	await sound.pauseAsync();
};

export const resumeSong = async () => {
	if (!sound) return;
	await sound.playAsync();
};

export const unloadSong = async () => {
	if (!sound) return;
	await sound.unloadAsync();
	sound = null;
	playbackStatusListener?.({
		positionMillis: 0,
		durationMillis: 0,
		isPlaying: false,
	});
};
