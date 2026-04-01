import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PlayerTrack } from '../components/Player';
import {
	pauseSong,
	playSongFromUrl,
	resumeSong,
	seekSongToPosition,
	setSongPlaybackRate,
	setPlaybackStatusListener,
	unloadSong,
} from '../services/audioPlayer';
import {
	deleteOfflineTrack,
	downloadTrackForOffline,
	offlineTrackExists,
} from '../services/offlineStorage';

export type RepeatMode = 'off' | 'all' | 'one';

type PlayerStore = {
	currentSong: PlayerTrack | null;
	isPlaying: boolean;
	queue: PlayerTrack[];
	currentTrackIndex: number;
	positionMillis: number;
	durationMillis: number;
	playbackRate: number;
	isShuffleEnabled: boolean;
	repeatMode: RepeatMode;
	downloadedTracks: Record<string, string>;
	setSong: (song: PlayerTrack) => void;
	togglePlay: () => void;
	setQueue: (songs: PlayerTrack[]) => void;
	playSong: (song: PlayerTrack, queue: PlayerTrack[]) => void;
	playQueueIndex: (index: number) => void;
	addToQueue: (song: PlayerTrack) => void;
	addToQueueNext: (song: PlayerTrack) => void;
	moveQueueItem: (fromIndex: number, toIndex: number) => void;
	removeFromQueue: (trackId: string) => void;
	playNext: (isAuto?: boolean) => void;
	playPrevious: () => void;
	seekTo: (positionMillis: number) => void;
	setPlaybackRate: (playbackRate: number) => void;
	toggleShuffleMode: () => void;
	cycleRepeatMode: () => void;
	downloadTrack: (track: PlayerTrack) => Promise<boolean>;
	removeDownloadedTrack: (trackId: string) => Promise<void>;
	isTrackDownloaded: (trackId: string) => boolean;
};

const getRandomIndex = (queueLength: number, excludeIndex: number): number => {
	if (queueLength <= 1) {
		return 0;
	}

	let candidateIndex = excludeIndex;
	while (candidateIndex === excludeIndex) {
		candidateIndex = Math.floor(Math.random() * queueLength);
	}

	return candidateIndex;
};

const getPlayableUrl = async (
	track: PlayerTrack,
	downloadedTracks: Record<string, string>,
): Promise<string | undefined> => {
	const localUri = downloadedTracks[track.id];
	if (localUri && await offlineTrackExists(localUri)) {
		return localUri;
	}

	return track.url;
};

const playTrackWithBestSource = async (
	track: PlayerTrack,
	playbackRate: number,
	downloadedTracks: Record<string, string>,
): Promise<boolean> => {
	const playableUrl = await getPlayableUrl(track, downloadedTracks);
	if (!playableUrl) {
		return false;
	}

	await playSongFromUrl(playableUrl, playbackRate);
	return true;
};

export const usePlayerStore = create<PlayerStore>()(
	persist(
		(set, get) => ({
			currentSong: null,
			isPlaying: false,
			queue: [],
			currentTrackIndex: 0,
			positionMillis: 0,
			durationMillis: 0,
			playbackRate: 1,
			isShuffleEnabled: false,
			repeatMode: 'off',
			downloadedTracks: {},

			setSong: (song) => {
				const { queue, currentTrackIndex, playbackRate, downloadedTracks } = get();
				const index = queue.findIndex((item) => item.id === song.id);
				const safeIndex = index >= 0 ? index : currentTrackIndex;

				set({
					currentSong: song,
					isPlaying: true,
					currentTrackIndex: safeIndex,
					positionMillis: 0,
				});

				void (async () => {
					const didStart = await playTrackWithBestSource(song, playbackRate, downloadedTracks);
					if (!didStart) {
						set({ isPlaying: false });
					}
				})();
			},

			togglePlay: () => {
				const {
					currentSong,
					isPlaying,
					positionMillis,
					durationMillis,
					playbackRate,
					downloadedTracks,
				} = get();

				if (!currentSong) {
					return;
				}

				if (isPlaying) {
					void pauseSong();
					set({ isPlaying: false });
					return;
				}

				// On fresh launches there may be no in-memory sound instance, so start track if needed.
				if (!durationMillis || positionMillis <= 0) {
					void (async () => {
						const didStart = await playTrackWithBestSource(currentSong, playbackRate, downloadedTracks);
						set({ isPlaying: didStart });
					})();
					return;
				}

				void resumeSong();
				set({ isPlaying: true });
			},

			setQueue: (songs) => {
				const { currentTrackIndex } = get();
				const safeIndex = songs.length ? Math.min(currentTrackIndex, songs.length - 1) : 0;

				set({
					queue: songs,
					currentTrackIndex: safeIndex,
					currentSong: songs.length ? songs[safeIndex] : null,
					isPlaying: songs.length ? get().isPlaying : false,
				});
			},

			playSong: (song, queue) => {
				if (!queue.length) {
					return;
				}

				const { playbackRate, downloadedTracks } = get();
				const index = queue.findIndex((item) => item.id === song.id);
				const safeIndex = index >= 0 ? index : 0;
				const track = queue[safeIndex];

				set({
					queue,
					currentTrackIndex: safeIndex,
					currentSong: track,
					isPlaying: true,
					positionMillis: 0,
				});

				void (async () => {
					const didStart = await playTrackWithBestSource(track, playbackRate, downloadedTracks);
					if (!didStart) {
						set({ isPlaying: false });
					}
				})();
			},

			playQueueIndex: (index) => {
				const { queue, playbackRate, downloadedTracks } = get();
				if (index < 0 || index >= queue.length) {
					return;
				}

				const track = queue[index];
				set({
					currentTrackIndex: index,
					currentSong: track,
					isPlaying: true,
					positionMillis: 0,
				});

				void (async () => {
					const didStart = await playTrackWithBestSource(track, playbackRate, downloadedTracks);
					if (!didStart) {
						set({ isPlaying: false });
					}
				})();
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

			moveQueueItem: (fromIndex, toIndex) => {
				const { queue, currentTrackIndex } = get();
				if (
					fromIndex < 0 ||
					toIndex < 0 ||
					fromIndex >= queue.length ||
					toIndex >= queue.length ||
					fromIndex === toIndex
				) {
					return;
				}

				const nextQueue = [...queue];
				const [movedTrack] = nextQueue.splice(fromIndex, 1);
				nextQueue.splice(toIndex, 0, movedTrack);

				let nextCurrentIndex = currentTrackIndex;
				if (fromIndex === currentTrackIndex) {
					nextCurrentIndex = toIndex;
				} else if (fromIndex < currentTrackIndex && toIndex >= currentTrackIndex) {
					nextCurrentIndex = currentTrackIndex - 1;
				} else if (fromIndex > currentTrackIndex && toIndex <= currentTrackIndex) {
					nextCurrentIndex = currentTrackIndex + 1;
				}

				set({
					queue: nextQueue,
					currentTrackIndex: nextCurrentIndex,
					currentSong: nextQueue[nextCurrentIndex] ?? null,
				});
			},

			removeFromQueue: (trackId) => {
				const {
					queue,
					currentTrackIndex,
					isPlaying,
					playbackRate,
					downloadedTracks,
				} = get();
				const removeIndex = queue.findIndex((track) => track.id === trackId);
				if (removeIndex < 0) {
					return;
				}

				const nextQueue = queue.filter((_, index) => index !== removeIndex);

				if (!nextQueue.length) {
					set({
						queue: [],
						currentSong: null,
						currentTrackIndex: 0,
						isPlaying: false,
						positionMillis: 0,
						durationMillis: 0,
					});
					void unloadSong();
					return;
				}

				let nextCurrentIndex = currentTrackIndex;
				let shouldStartReplacement = false;

				if (removeIndex === currentTrackIndex) {
					nextCurrentIndex = Math.min(removeIndex, nextQueue.length - 1);
					shouldStartReplacement = isPlaying;
				} else if (removeIndex < currentTrackIndex) {
					nextCurrentIndex = Math.max(0, currentTrackIndex - 1);
				}

				const nextSong = nextQueue[nextCurrentIndex] ?? null;

				set({
					queue: nextQueue,
					currentTrackIndex: nextCurrentIndex,
					currentSong: nextSong,
					positionMillis: removeIndex === currentTrackIndex ? 0 : get().positionMillis,
					isPlaying: removeIndex === currentTrackIndex ? shouldStartReplacement : get().isPlaying,
				});

				if (shouldStartReplacement && nextSong) {
					void (async () => {
						const didStart = await playTrackWithBestSource(nextSong, playbackRate, downloadedTracks);
						if (!didStart) {
							set({ isPlaying: false });
						}
					})();
				}
			},

			playNext: (isAuto = false) => {
				const {
					queue,
					currentTrackIndex,
					playbackRate,
					repeatMode,
					isShuffleEnabled,
					downloadedTracks,
				} = get();

				if (!queue.length) {
					return;
				}

				const candidateIndices: number[] = [];

				if (isAuto && repeatMode === 'one') {
					candidateIndices.push(currentTrackIndex);
				} else if (isShuffleEnabled) {
					const pool = queue.length <= 1
						? [0]
						: queue.map((_, index) => index).filter((index) => index !== currentTrackIndex);

					while (pool.length) {
						const randomPoolIndex = Math.floor(Math.random() * pool.length);
						const [nextIndex] = pool.splice(randomPoolIndex, 1);
						candidateIndices.push(nextIndex);
					}
				} else {
					const shouldWrap = !(isAuto && repeatMode === 'off');

					for (let index = currentTrackIndex + 1; index < queue.length; index += 1) {
						candidateIndices.push(index);
					}

					if (shouldWrap) {
						for (let index = 0; index <= currentTrackIndex; index += 1) {
							candidateIndices.push(index);
						}
					}
				}

				if (!candidateIndices.length) {
					set({
						isPlaying: false,
						positionMillis: 0,
						durationMillis: 0,
					});
					return;
				}

				void (async () => {
					for (const nextIndex of candidateIndices) {
						const track = queue[nextIndex];
						const didStart = await playTrackWithBestSource(track, playbackRate, downloadedTracks);

						if (!didStart) {
							continue;
						}

						set({
							currentTrackIndex: nextIndex,
							currentSong: track,
							isPlaying: true,
							positionMillis: 0,
						});
						return;
					}

					set({
						isPlaying: false,
						positionMillis: 0,
						durationMillis: 0,
					});
				})();
			},

			playPrevious: () => {
				const {
					queue,
					currentTrackIndex,
					positionMillis,
					isShuffleEnabled,
					playbackRate,
					downloadedTracks,
				} = get();

				if (!queue.length) {
					return;
				}

				if (positionMillis > 5000) {
					void seekSongToPosition(0);
					set({ positionMillis: 0 });
					return;
				}

				const previousIndex = isShuffleEnabled
					? getRandomIndex(queue.length, currentTrackIndex)
					: (currentTrackIndex - 1 + queue.length) % queue.length;

				const track = queue[previousIndex];

				set({
					currentTrackIndex: previousIndex,
					currentSong: track,
					isPlaying: true,
					positionMillis: 0,
				});

				void (async () => {
					const didStart = await playTrackWithBestSource(track, playbackRate, downloadedTracks);
					if (!didStart) {
						set({ isPlaying: false });
					}
				})();
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

			toggleShuffleMode: () => {
				set((state) => ({ isShuffleEnabled: !state.isShuffleEnabled }));
			},

			cycleRepeatMode: () => {
				set((state) => ({
					repeatMode: state.repeatMode === 'off'
						? 'all'
						: state.repeatMode === 'all'
							? 'one'
							: 'off',
				}));
			},

			downloadTrack: async (track) => {
				if (!track.url) {
					return false;
				}

				try {
					const localUri = await downloadTrackForOffline(track.id, track.url);
					set((state) => ({
						downloadedTracks: {
							...state.downloadedTracks,
							[track.id]: localUri,
						},
					}));
					return true;
				} catch (error) {
					console.error('Offline download failed:', error);
					return false;
				}
			},

			removeDownloadedTrack: async (trackId) => {
				const fileUri = get().downloadedTracks[trackId];
				if (!fileUri) {
					return;
				}

				try {
					await deleteOfflineTrack(fileUri);
				} catch (error) {
					console.error('Remove downloaded track failed:', error);
				}

				set((state) => {
					const { [trackId]: _removed, ...rest } = state.downloadedTracks;
					return { downloadedTracks: rest };
				});
			},

			isTrackDownloaded: (trackId) => Boolean(get().downloadedTracks[trackId]),
		}),
		{
			name: 'lokal-player-store-v1',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				currentSong: state.currentSong,
				queue: state.queue,
				currentTrackIndex: state.currentTrackIndex,
				playbackRate: state.playbackRate,
				isShuffleEnabled: state.isShuffleEnabled,
				repeatMode: state.repeatMode,
				downloadedTracks: state.downloadedTracks,
			}),
		},
	),
);

let lastFinishedTrackId: string | null = null;

setPlaybackStatusListener((status) => {
	usePlayerStore.setState({
		positionMillis: status.positionMillis,
		durationMillis: status.durationMillis,
		isPlaying: status.isPlaying,
	});

	if (!status.didJustFinish) {
		lastFinishedTrackId = null;
		return;
	}

	const finishedTrackId = usePlayerStore.getState().currentSong?.id || null;
	if (!finishedTrackId || finishedTrackId === lastFinishedTrackId) {
		return;
	}

	lastFinishedTrackId = finishedTrackId;
	usePlayerStore.getState().playNext(true);
});
