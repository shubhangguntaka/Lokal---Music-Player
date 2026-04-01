import { create } from 'zustand';
import { PlayerTrack } from '../components/Player';

export type Playlist = {
	id: string;
	name: string;
	tracks: PlayerTrack[];
};

type LibraryStore = {
	favourites: PlayerTrack[];
	playlists: Playlist[];
	isFavourite: (trackId: string) => boolean;
	addToFavourites: (track: PlayerTrack) => void;
	removeFromFavourites: (trackId: string) => void;
	toggleFavourite: (track: PlayerTrack) => void;
	createPlaylist: (name?: string) => void;
	addTrackToPlaylist: (playlistId: string, track: PlayerTrack) => void;
	removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
};

const DEFAULT_PLAYLIST: Playlist = {
	id: 'playlist-main',
	name: 'My Playlist',
	tracks: [],
};

const createPlaylistId = () => `playlist-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const useLibraryStore = create<LibraryStore>((set, get) => ({
	favourites: [],
	playlists: [DEFAULT_PLAYLIST],

	isFavourite: (trackId) => get().favourites.some((track) => track.id === trackId),

	addToFavourites: (track) => {
		set((state) => {
			if (state.favourites.some((item) => item.id === track.id)) {
				return state;
			}

			return {
				favourites: [track, ...state.favourites],
			};
		});
	},

	removeFromFavourites: (trackId) => {
		set((state) => ({
			favourites: state.favourites.filter((track) => track.id !== trackId),
		}));
	},

	toggleFavourite: (track) => {
		set((state) => {
			const isSaved = state.favourites.some((item) => item.id === track.id);
			if (isSaved) {
				return {
					favourites: state.favourites.filter((item) => item.id !== track.id),
				};
			}

			return {
				favourites: [track, ...state.favourites],
			};
		});
	},

	createPlaylist: (name) => {
		set((state) => ({
			playlists: [
				...state.playlists,
				{
					id: createPlaylistId(),
					name: name?.trim() || `Playlist ${state.playlists.length + 1}`,
					tracks: [],
				},
			],
		}));
	},

	addTrackToPlaylist: (playlistId, track) => {
		set((state) => ({
			playlists: state.playlists.map((playlist) => {
				if (playlist.id !== playlistId) {
					return playlist;
				}

				if (playlist.tracks.some((item) => item.id === track.id)) {
					return playlist;
				}

				return {
					...playlist,
					tracks: [...playlist.tracks, track],
				};
			}),
		}));
	},

	removeTrackFromPlaylist: (playlistId, trackId) => {
		set((state) => ({
			playlists: state.playlists.map((playlist) => {
				if (playlist.id !== playlistId) {
					return playlist;
				}

				return {
					...playlist,
					tracks: playlist.tracks.filter((track) => track.id !== trackId),
				};
			}),
		}));
	},
}));
