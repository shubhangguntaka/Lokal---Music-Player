import { create } from 'zustand';
import { PlayerTrack } from '../components/Player';
import {
	pauseSong,
	playSongFromUrl,
	resumeSong,
	seekSongToPosition,
	setSongPlaybackRate,
	setPlaybackStatusListener,
} from '../services/audioPlayer';

type PlayerStore = {
	currentSong: PlayerTrack | null;
	isPlaying: boolean;
	queue: PlayerTrack[];
	currentTrackIndex: number;
	positionMillis: number;
	durationMillis: number;
	playbackRate: number;
	setSong: (song: PlayerTrack) => void;
	togglePlay: () => void;
	setQueue: (songs: PlayerTrack[]) => void;
	playSong: (song: PlayerTrack, queue: PlayerTrack[]) => void;
	addToQueue: (song: PlayerTrack) => void;
	addToQueueNext: (song: PlayerTrack) => void;
	playNext: () => void;
	playPrevious: () => void;
	seekTo: (positionMillis: number) => void;
	setPlaybackRate: (playbackRate: number) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentTrackIndex: 0,
	positionMillis: 0,
	durationMillis: 0,
	playbackRate: 1,

	setSong: (song) =>
		set((state) => {
			const index = state.queue.findIndex((item) => item.id === song.id);
			if (song.url) {
				void playSongFromUrl(song.url, state.playbackRate);
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
		const { playbackRate } = get();
		const index = queue.findIndex((item) => item.id === song.id);
		const safeIndex = index >= 0 ? index : 0;
		const track = queue[safeIndex];

		if (track.url) {
			void playSongFromUrl(track.url, playbackRate);
		}

		set({
			queue,
			currentTrackIndex: safeIndex,
			currentSong: track,
			isPlaying: true,
			positionMillis: 0,
		});
	},

	addToQueue: (song) => {
		set((state) => {
			if (state.queue.some((item) => item.id === song.id)) {
				return state;
			}

			if (!state.queue.length && !state.currentSong) {
				return {
					queue: [song],
					currentSong: song,
					currentTrackIndex: 0,
					isPlaying: false,
				};
			}

			return {
				queue: [...state.queue, song],
			};
		});
	},

	addToQueueNext: (song) => {
		set((state) => {
			if (state.queue.some((item) => item.id === song.id)) {
				return state;
			}

			if (!state.queue.length && !state.currentSong) {
				return {
					queue: [song],
					currentSong: song,
					currentTrackIndex: 0,
					isPlaying: false,
				};
			}

			const insertIndex = Math.min(state.currentTrackIndex + 1, state.queue.length);
			const nextQueue = [...state.queue];
			nextQueue.splice(insertIndex, 0, song);

			return {
				queue: nextQueue,
			};
		});
	},

	playNext: () => {
		const { queue, currentTrackIndex, playbackRate } = get();
		if (!queue.length) return;
		const nextIndex = (currentTrackIndex + 1) % queue.length;
		const track = queue[nextIndex];

		if (track.url) {
			void playSongFromUrl(track.url, playbackRate);
		}

		set({
			currentTrackIndex: nextIndex,
			currentSong: track,
			isPlaying: true,
			positionMillis: 0,
		});
	},

	playPrevious: () => {
		const { queue, currentTrackIndex, playbackRate } = get();
		if (!queue.length) return;
		const previousIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
		const track = queue[previousIndex];

		if (track.url) {
			void playSongFromUrl(track.url, playbackRate);
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

	setPlaybackRate: (playbackRate) => {
		const boundedRate = Math.max(0.75, Math.min(playbackRate, 2));
		void setSongPlaybackRate(boundedRate);
		set({ playbackRate: boundedRate });
	},
}));

setPlaybackStatusListener((status) => {
	usePlayerStore.setState({
		positionMillis: status.positionMillis,
		durationMillis: status.durationMillis,
		isPlaying: status.isPlaying,
	});
});
