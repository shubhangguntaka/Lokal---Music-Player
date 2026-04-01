import { create } from 'zustand';
import { PlayerTrack } from '../components/Player';
import {
	pauseSong,
	playSongFromUrl,
	resumeSong,
	seekSongToPosition,
	setPlaybackStatusListener,
} from '../services/audioPlayer';

type PlayerStore = {
	currentSong: PlayerTrack | null;
	isPlaying: boolean;
	queue: PlayerTrack[];
	currentTrackIndex: number;
	positionMillis: number;
	durationMillis: number;
	setSong: (song: PlayerTrack) => void;
	togglePlay: () => void;
	setQueue: (songs: PlayerTrack[]) => void;
	playSong: (song: PlayerTrack, queue: PlayerTrack[]) => void;
	playNext: () => void;
	playPrevious: () => void;
	seekTo: (positionMillis: number) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentTrackIndex: 0,
	positionMillis: 0,
	durationMillis: 0,

	setSong: (song) =>
		set((state) => {
			const index = state.queue.findIndex((item) => item.id === song.id);
			if (song.url) {
				void playSongFromUrl(song.url);
			}
			return {
				currentSong: song,
				isPlaying: true,
				currentTrackIndex: index >= 0 ? index : state.currentTrackIndex,
				positionMillis: 0,
			};
		}),

	togglePlay: () => {
		const { currentSong, isPlaying } = get();
		if (!currentSong) return;

		if (currentSong.url) {
			if (isPlaying) {
				void pauseSong();
			} else {
				void resumeSong();
			}
		}

		set({ isPlaying: !isPlaying });
	},

	setQueue: (songs) =>
		set((state) => ({
			queue: songs,
			currentTrackIndex: songs.length ? Math.min(state.currentTrackIndex, songs.length - 1) : 0,
			currentSong: songs.length
				? songs[Math.min(state.currentTrackIndex, songs.length - 1)]
				: null,
			isPlaying: songs.length ? state.isPlaying : false,
		})),

	playSong: (song, queue) => {
		if (!queue.length) return;
		const index = queue.findIndex((item) => item.id === song.id);
		const safeIndex = index >= 0 ? index : 0;
		const track = queue[safeIndex];

		if (track.url) {
			void playSongFromUrl(track.url);
		}

		set({
			queue,
			currentTrackIndex: safeIndex,
			currentSong: track,
			isPlaying: true,
			positionMillis: 0,
		});
	},

	playNext: () => {
		const { queue, currentTrackIndex } = get();
		if (!queue.length) return;
		const nextIndex = (currentTrackIndex + 1) % queue.length;
		const track = queue[nextIndex];

		if (track.url) {
			void playSongFromUrl(track.url);
		}

		set({
			currentTrackIndex: nextIndex,
			currentSong: track,
			isPlaying: true,
			positionMillis: 0,
		});
	},

	playPrevious: () => {
		const { queue, currentTrackIndex } = get();
		if (!queue.length) return;
		const previousIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
		const track = queue[previousIndex];

		if (track.url) {
			void playSongFromUrl(track.url);
		}

		set({
			currentTrackIndex: previousIndex,
			currentSong: track,
			isPlaying: true,
			positionMillis: 0,
		});
	},

	seekTo: (positionMillis) => {
		const { durationMillis } = get();
		const boundedPosition = Math.max(
			0,
			Math.min(positionMillis, durationMillis || positionMillis),
		);

		void seekSongToPosition(boundedPosition);
		set({ positionMillis: boundedPosition });
	},
}));

setPlaybackStatusListener((status) => {
	usePlayerStore.setState({
		positionMillis: status.positionMillis,
		durationMillis: status.durationMillis,
		isPlaying: status.isPlaying,
	});
});
