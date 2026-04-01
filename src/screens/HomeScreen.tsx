import React, { useEffect, useRef, useState } from 'react';
import {
	Alert,
	FlatList,
	Image,
	ImageSourcePropType,
	Modal,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Share,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { PlayerTrack } from '../components/Player';
import SectionHeader from '../components/SectionHeader';
import TabBar from '../components/TabBar';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	formatDuration,
	getArtistName,
	searchAlbums,
	searchArtists,
	searchSongs,
	SearchResult,
} from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';

type MusicItem = {
	id: string;
	title: string;
	artist?: string;
	image: ImageSourcePropType;
	sourceSongId?: string;
	url?: string;
	duration?: string;
};

type ArtistItem = {
	id: string;
	name: string;
	image: ImageSourcePropType;
	albums: number;
	songs: number;
	totalDuration?: string;
};

type SongListItem = {
	id: string;
	title: string;
	artist: string;
	duration: string;
	image: ImageSourcePropType;
	url?: string;
};

type AlbumItem = {
	id: string;
	title: string;
	artist: string;
	year: number;
	songs: number;
	image: ImageSourcePropType;
	totalDuration?: string;
};

type HomeTab = 'Suggested' | 'Songs' | 'Artists' | 'Albums';

const tabs: HomeTab[] = ['Suggested', 'Songs', 'Artists', 'Albums'];

const albumArtwork = require('../../assets/icon.png');
const artistArtwork = require('../../assets/adaptive-icon.png');
const altArtwork = require('../../assets/splash-icon.png');

const LANGUAGE_QUERIES = [
	'Telugu hit songs',
	'Hindi hit songs',
	'English hit songs',
	'Tamil hit songs',
	'Kannada hit songs',
	'Malayalam hit songs',
];

const FEATURED_ARTIST_NAMES = [
	'S. Thaman',
	'Anirudh Ravichander',
	'M.M. Keeravani',
	'Sai Abhyankkar',
	'Sid Sriram',
	'Devi Sri Prasad',
	'Yuvan Shankar Raja',
	'G. V. Prakash Kumar',
];

const TELUGU_ESSENTIALS_ALBUM_QUERIES = [
	'Telugu Essentials',
	'Telugu Love Essentials',
	'Telugu Dance Essentials',
	'Telugu Melody Essentials',
];

const defaultSongsData: SongListItem[] = [
	{ id: '1', title: 'Samajavaragamana', artist: 'Sid Sriram', duration: '03:48 mins', image: albumArtwork },
	{ id: '2', title: 'Butta Bomma', artist: 'Armaan Malik', duration: '03:18 mins', image: altArtwork },
	{ id: '3', title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', duration: '04:39 mins', image: artistArtwork },
	{ id: '4', title: 'Kalaavathi', artist: 'Sid Sriram', duration: '04:02 mins', image: albumArtwork },
	{ id: '5', title: 'Belakina Kavithe', artist: 'Sanjith Hegde', duration: '03:39 mins', image: altArtwork },
	{ id: '6', title: 'Malare', artist: 'Vijay Yesudas', duration: '05:16 mins', image: artistArtwork },
];

const defaultRecentlyPlayed: MusicItem[] = [
	{ id: 'recent-1', sourceSongId: '1', title: 'Samajavaragamana', artist: 'Sid Sriram', image: albumArtwork },
	{ id: 'recent-2', sourceSongId: '2', title: 'Butta Bomma', artist: 'Armaan Malik', image: altArtwork },
	{ id: 'recent-3', sourceSongId: '3', title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', image: artistArtwork },
	{ id: 'recent-4', sourceSongId: '4', title: 'Kalaavathi', artist: 'Sid Sriram', image: albumArtwork },
];

const defaultMostPlayed: MusicItem[] = [
	{ id: 'most-3', sourceSongId: '3', title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', image: artistArtwork },
	{ id: 'most-4', sourceSongId: '4', title: 'Kalaavathi', artist: 'Sid Sriram', image: albumArtwork },
	{ id: 'most-5', sourceSongId: '5', title: 'Belakina Kavithe', artist: 'Sanjith Hegde', image: altArtwork },
	{ id: 'most-6', sourceSongId: '6', title: 'Malare', artist: 'Vijay Yesudas', image: artistArtwork },
];

const defaultArtists: ArtistItem[] = [
	{ id: '1', name: 'S. Thaman', image: artistArtwork, albums: 8, songs: 120 },
	{ id: '2', name: 'Anirudh Ravichander', image: albumArtwork, albums: 9, songs: 140 },
	{ id: '3', name: 'M.M. Keeravani', image: altArtwork, albums: 12, songs: 180 },
	{ id: '4', name: 'Sai Abhyankkar', image: albumArtwork, albums: 2, songs: 16 },
	{ id: '5', name: 'Sid Sriram', image: artistArtwork, albums: 6, songs: 90 },
	{ id: '6', name: 'Devi Sri Prasad', image: altArtwork, albums: 11, songs: 170 },
	{ id: '7', name: 'Yuvan Shankar Raja', image: albumArtwork, albums: 10, songs: 160 },
	{ id: '8', name: 'G. V. Prakash Kumar', image: artistArtwork, albums: 7, songs: 110 },
];

const defaultAlbumsData: AlbumItem[] = [
	{ id: '1', title: 'Telugu Essentials', artist: 'JioSaavn', year: 2024, songs: 50, image: albumArtwork },
	{ id: '2', title: 'Telugu Romance Essentials', artist: 'JioSaavn', year: 2024, songs: 40, image: altArtwork },
	{ id: '3', title: 'Telugu Dance Essentials', artist: 'JioSaavn', year: 2024, songs: 45, image: artistArtwork },
	{ id: '4', title: 'Telugu Melody Essentials', artist: 'JioSaavn', year: 2024, songs: 42, image: albumArtwork },
];

const sortOptions = [
	'Ascending',
	'Descending',
	'Artist',
	'Album',
	'Year',
	'Date Added',
	'Date Modified',
	'Composer',
];

const songOptions = [
	'Play Next',
	'Add to Playing Queue',
	'Add to Playlist',
	'Go to Album',
	'Go to Artist',
	'Details',
	'Set as Ringtone',
	'Add to Blacklist',
	'Share',
	'Delete from Device',
];

const artistOptions = ['Play', 'Play Next', 'Add to Playing Queue', 'Add to Playlist', 'Share'];

const albumOptions = ['Play', 'Play Next', 'Add to Playing Queue', 'Add to Playlist', 'Go to Artist', 'Details', 'Share'];

const HomeScreen: React.FC<{ onSearchPress?: () => void; onArtistPress?: (artist: ArtistItem) => void; onAlbumPress?: (album: AlbumItem) => void; onPlaySong?: (song: PlayerTrack, queue: PlayerTrack[]) => void }> = ({ onSearchPress, onArtistPress, onAlbumPress, onPlaySong }) => {
	const [activeTab, setActiveTab] = useState<HomeTab>('Suggested');
	const pagerRef = useRef<ScrollView>(null);
	const { width } = useWindowDimensions();
	const [currentSort, setCurrentSort] = useState('Ascending');
	const [playingSongId, setPlayingSongId] = useState('');
	const [songsData, setSongsData] = useState<SongListItem[]>(defaultSongsData);
	const [artistsData, setArtistsData] = useState<ArtistItem[]>(defaultArtists);
	const [albumsData, setAlbumsData] = useState<AlbumItem[]>(defaultAlbumsData);
	const [recentlyPlayed, setRecentlyPlayed] = useState<MusicItem[]>(defaultRecentlyPlayed);
	const [mostPlayed, setMostPlayed] = useState<MusicItem[]>(defaultMostPlayed);
	const [isSortModalVisible, setSortModalVisible] = useState(false);
	const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
	const [isArtistOptionsModalVisible, setArtistOptionsModalVisible] = useState(false);
	const [isAlbumOptionsModalVisible, setAlbumOptionsModalVisible] = useState(false);
	const [isPagerScrollEnabled, setPagerScrollEnabled] = useState(true);
	const [selectedSong, setSelectedSong] = useState<SongListItem | null>(null);
	const [selectedArtist, setSelectedArtist] = useState<ArtistItem | null>(null);
	const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
	const addToQueue = usePlayerStore((state) => state.addToQueue);
	const addToQueueNext = usePlayerStore((state) => state.addToQueueNext);
	const playlists = useLibraryStore((state) => state.playlists);
	const isFavourite = useLibraryStore((state) => state.isFavourite);
	const toggleFavourite = useLibraryStore((state) => state.toggleFavourite);
	const addTrackToPlaylist = useLibraryStore((state) => state.addTrackToPlaylist);
	const primaryPlaylist = playlists[0];

	const toPlayerTrack = (song: SongListItem): PlayerTrack => ({
		id: song.id,
		title: song.title,
		artist: song.artist,
		image: song.image,
		url: song.url,
	});

	const sortSongsList = (items: SongListItem[], option: string): SongListItem[] => {
		const sorted = [...items];

		switch (option) {
			case 'Ascending':
				sorted.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case 'Descending':
				sorted.sort((a, b) => b.title.localeCompare(a.title));
				break;
			case 'Artist':
				sorted.sort((a, b) => a.artist.localeCompare(b.artist));
				break;
			default:
				break;
		}

		return sorted;
	};

	const sortArtistsList = (items: ArtistItem[], option: string): ArtistItem[] => {
		const sorted = [...items];

		switch (option) {
			case 'Ascending':
				sorted.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case 'Descending':
				sorted.sort((a, b) => b.name.localeCompare(a.name));
				break;
			default:
				break;
		}

		return sorted;
	};

	const sortAlbumsList = (items: AlbumItem[], option: string): AlbumItem[] => {
		const sorted = [...items];

		switch (option) {
			case 'Ascending':
				sorted.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case 'Descending':
				sorted.sort((a, b) => b.title.localeCompare(a.title));
				break;
			case 'Artist':
				sorted.sort((a, b) => a.artist.localeCompare(b.artist));
				break;
			case 'Year':
				sorted.sort((a, b) => b.year - a.year);
				break;
			default:
				break;
		}

		return sorted;
	};

	const applySortForActiveTab = (option: string) => {
		setCurrentSort(option);

		if (activeTab === 'Songs') {
			setSongsData((prev) => sortSongsList(prev, option));
		}

		if (activeTab === 'Artists') {
			setArtistsData((prev) => sortArtistsList(prev, option));
		}

		if (activeTab === 'Albums') {
			setAlbumsData((prev) => sortAlbumsList(prev, option));
		}

		setSortModalVisible(false);
	};

	const findSongByArtist = (artistName: string): SongListItem | undefined =>
		songsData.find((song) =>
			song.artist.toLowerCase().includes(artistName.toLowerCase()),
		);

	const findSongByAlbum = (album: AlbumItem): SongListItem | undefined => {
		const albumTitleToken = album.title.split(' ')[0]?.toLowerCase() || '';

		return songsData.find((song) =>
			song.artist.toLowerCase().includes(album.artist.toLowerCase()) ||
			song.title.toLowerCase().includes(albumTitleToken),
		);
	};

	const closeSongOptions = () => {
		setOptionsModalVisible(false);
		setSelectedSong(null);
	};

	const closeArtistOptions = () => {
		setArtistOptionsModalVisible(false);
		setSelectedArtist(null);
	};

	const closeAlbumOptions = () => {
		setAlbumOptionsModalVisible(false);
		setSelectedAlbum(null);
	};

	const handleHorizontalListScrollStart = () => {
		setPagerScrollEnabled(false);
	};

	const handleHorizontalListScrollEnd = () => {
		setPagerScrollEnabled(true);
	};

	const handleSongOptionPress = async (option: string) => {
		if (!selectedSong) {
			return;
		}

		const songTrack = toPlayerTrack(selectedSong);

		switch (option) {
			case 'Play Next':
				addToQueueNext(songTrack);
				break;
			case 'Add to Playing Queue':
				addToQueue(songTrack);
				break;
			case 'Add to Playlist':
				if (primaryPlaylist) {
					addTrackToPlaylist(primaryPlaylist.id, songTrack);
				}
				break;
			case 'Go to Album': {
				const albumMatch = albumsData.find((album) =>
					album.artist.toLowerCase().includes(selectedSong.artist.toLowerCase()),
				);

				if (albumMatch) {
					onAlbumPress?.({
						...albumMatch,
						totalDuration: albumMatch.totalDuration || '01:20:38 mins',
					});
				}

				break;
			}
			case 'Go to Artist': {
				const artistMatch = artistsData.find((artist) =>
					selectedSong.artist.toLowerCase().includes(artist.name.toLowerCase()) ||
					artist.name.toLowerCase().includes(selectedSong.artist.toLowerCase()),
				);

				if (artistMatch) {
					onArtistPress?.({
						...artistMatch,
						totalDuration: artistMatch.totalDuration || '01:25:43 mins',
					});
				}

				break;
			}
			case 'Details':
				Alert.alert(
					'Song Details',
					`${selectedSong.title}\n${selectedSong.artist}\n${selectedSong.duration}`,
				);
				break;
			case 'Set as Ringtone':
				Alert.alert('Ringtone', 'Ringtone support will be added soon.');
				break;
			case 'Add to Blacklist':
				Alert.alert('Blacklist', `${selectedSong.title} added to blacklist.`);
				break;
			case 'Share':
				await Share.share({
					message: `${selectedSong.title} by ${selectedSong.artist}`,
				});
				break;
			case 'Delete from Device':
				setSongsData((prev) => prev.filter((song) => song.id !== selectedSong.id));
				setRecentlyPlayed((prev) =>
					prev.filter((song) => song.sourceSongId !== selectedSong.id),
				);
				setMostPlayed((prev) =>
					prev.filter((song) => song.sourceSongId !== selectedSong.id),
				);
				if (playingSongId === selectedSong.id) {
					setPlayingSongId('');
				}
				break;
			default:
				break;
		}

		closeSongOptions();
	};

	const handleArtistOptionPress = async (option: string) => {
		if (!selectedArtist) {
			return;
		}

		const artistSongs = songsData.filter((song) =>
			song.artist.toLowerCase().includes(selectedArtist.name.toLowerCase()),
		);
		const selectedArtistSong = artistSongs[0] || findSongByArtist(selectedArtist.name);

		switch (option) {
			case 'Play':
				if (selectedArtistSong && onPlaySong) {
					setPlayingSongId(selectedArtistSong.id);
					onPlaySong(toPlayerTrack(selectedArtistSong), queueFromSongs());
				}
				break;
			case 'Play Next':
				if (selectedArtistSong) {
					addToQueueNext(toPlayerTrack(selectedArtistSong));
				}
				break;
			case 'Add to Playing Queue':
				if (selectedArtistSong) {
					addToQueue(toPlayerTrack(selectedArtistSong));
				}
				break;
			case 'Add to Playlist':
				if (primaryPlaylist) {
					artistSongs.forEach((song) => {
						addTrackToPlaylist(primaryPlaylist.id, toPlayerTrack(song));
					});
				}
				break;
			case 'Share':
				await Share.share({
					message: `${selectedArtist.name} on Lokal Music Player`,
				});
				break;
			default:
				break;
		}

		closeArtistOptions();
	};

	const handleAlbumOptionPress = async (option: string) => {
		if (!selectedAlbum) {
			return;
		}

		const selectedAlbumSong = findSongByAlbum(selectedAlbum);

		switch (option) {
			case 'Play':
				if (selectedAlbumSong && onPlaySong) {
					setPlayingSongId(selectedAlbumSong.id);
					onPlaySong(toPlayerTrack(selectedAlbumSong), queueFromSongs());
				}
				break;
			case 'Play Next':
				if (selectedAlbumSong) {
					addToQueueNext(toPlayerTrack(selectedAlbumSong));
				}
				break;
			case 'Add to Playing Queue':
				if (selectedAlbumSong) {
					addToQueue(toPlayerTrack(selectedAlbumSong));
				}
				break;
			case 'Add to Playlist':
				if (primaryPlaylist && selectedAlbumSong) {
					addTrackToPlaylist(primaryPlaylist.id, toPlayerTrack(selectedAlbumSong));
				}
				break;
			case 'Go to Artist': {
				const artistMatch = artistsData.find((artist) =>
					selectedAlbum.artist.toLowerCase().includes(artist.name.toLowerCase()) ||
					artist.name.toLowerCase().includes(selectedAlbum.artist.toLowerCase()),
				);

				if (artistMatch) {
					onArtistPress?.({
						...artistMatch,
						totalDuration: artistMatch.totalDuration || '01:25:43 mins',
					});
				}

				break;
			}
			case 'Details':
				Alert.alert(
					'Album Details',
					`${selectedAlbum.title}\n${selectedAlbum.artist}\n${selectedAlbum.year} • ${selectedAlbum.songs} songs`,
				);
				break;
			case 'Share':
				await Share.share({
					message: `${selectedAlbum.title} by ${selectedAlbum.artist}`,
				});
				break;
			default:
				break;
		}

		closeAlbumOptions();
	};

	useEffect(() => {
		let mounted = true;

		const mapSong = (song: SearchResult): SongListItem => ({
			id: song.id,
			title: song.title,
			artist: getArtistName(song),
			duration: `${formatDuration(song.duration)} mins`,
			image: { uri: song.image },
			url: song.url,
		});

		const loadHomeData = async () => {
			try {
				const languageResults = await Promise.all(
					LANGUAGE_QUERIES.map((query) => searchSongs(query)),
				);

				const mergedSongs = languageResults
					.flat()
					.filter((song) => song.id && song.title && song.url)
					.filter((song, index, arr) => arr.findIndex((s) => s.id === song.id) === index)
					.slice(0, 32)
					.map(mapSong);

				const artistResults = await Promise.all(
					FEATURED_ARTIST_NAMES.map((name) => searchArtists(name)),
				);

				const apiArtists = artistResults.reduce<ArtistItem[]>((acc, results, index) => {
					const topArtist = results[0];
					if (!topArtist) {
						return acc;
					}

					acc.push({
						id: topArtist.id || `artist-${index}`,
						name: topArtist.title,
						image: { uri: topArtist.image },
						albums: 1,
						songs: 20,
					});

					return acc;
				}, []);

				const albumResults = await Promise.all(
					TELUGU_ESSENTIALS_ALBUM_QUERIES.map((query) => searchAlbums(query)),
				);

				const apiAlbums: AlbumItem[] = albumResults
					.flat()
					.filter((album) => album.id && album.title)
					.filter((album, index, arr) => arr.findIndex((a) => a.id === album.id) === index)
					.slice(0, 12)
					.map((album, index) => ({
						id: album.id || `album-${index}`,
						title: album.title,
						artist: album.description?.split('|')[0]?.trim() || 'JioSaavn',
						year: Number(album.year) || 2024,
						songs: Number(album.songCount) || 20,
						image: { uri: album.image },
					}));

				if (!mounted) {
					return;
				}

				if (mergedSongs.length > 0) {
					setSongsData(mergedSongs);
					setRecentlyPlayed(
						mergedSongs.slice(0, 8).map((song) => ({
							id: `recent-${song.id}`,
							sourceSongId: song.id,
							title: song.title,
							artist: song.artist,
							image: song.image,
							url: song.url,
							duration: song.duration,
						})),
					);

					setMostPlayed(
						mergedSongs.slice(8, 16).map((song) => ({
							id: `most-${song.id}`,
							sourceSongId: song.id,
							title: song.title,
							artist: song.artist,
							image: song.image,
							url: song.url,
							duration: song.duration,
						})),
					);
				}

				if (apiArtists.length > 0) {
					setArtistsData(apiArtists);
				}

				if (apiAlbums.length > 0) {
					setAlbumsData(apiAlbums);
				}
			} catch (error) {
				console.error('Home API load error:', error);
			}
		};

		void loadHomeData();

		return () => {
			mounted = false;
		};
	}, []);

	const scrollToTab = (tab: HomeTab, animated: boolean) => {
		const nextIndex = tabs.indexOf(tab);
		if (nextIndex < 0) return;

		pagerRef.current?.scrollTo({
			x: nextIndex * width,
			animated,
		});
	};

	const handleChangeTab = (tab: HomeTab, animated = true) => {
		setPagerScrollEnabled(true);
		setActiveTab(tab);
		scrollToTab(tab, animated);
	};

	const handleSeeAllPress = (tab: HomeTab) => {
		handleChangeTab(tab);
	};

	const handlePagerEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		setPagerScrollEnabled(true);
		const offsetX = event.nativeEvent.contentOffset.x;
		const nextIndex = Math.round(offsetX / width);
		const nextTab = tabs[nextIndex];

		if (nextTab && nextTab !== activeTab) {
			setActiveTab(nextTab);
		}
	};

	useEffect(() => {
		scrollToTab(activeTab, false);
	}, [width]);

	const resolveMusicItemToSong = (item: MusicItem): SongListItem | undefined =>
		songsData.find((song) =>
			song.id === item.sourceSongId ||
			song.id === item.id ||
			song.title.toLowerCase() === item.title.toLowerCase(),
		);

	const handlePlayMusicCard = (item: MusicItem) => {
		const matchedSong = resolveMusicItemToSong(item);

		if (matchedSong?.url) {
			const playableQueue = queueFromSongs().filter((track) => Boolean(track.url));
			setPlayingSongId(matchedSong.id);
			onPlaySong?.(
				toPlayerTrack(matchedSong),
				playableQueue.length ? playableQueue : [toPlayerTrack(matchedSong)],
			);
			return;
		}

		const fallbackUrl = item.url || matchedSong?.url;

		if (!fallbackUrl) {
			Alert.alert('Track unavailable', 'Unable to play this item right now.');
			return;
		}

		const fallbackTrack: PlayerTrack = {
			id: matchedSong?.id || item.sourceSongId || item.id,
			title: matchedSong?.title || item.title,
			artist: matchedSong?.artist || item.artist || 'Unknown Artist',
			image: matchedSong?.image || item.image,
			url: fallbackUrl,
		};

		setPlayingSongId(fallbackTrack.id);
		onPlaySong?.(fallbackTrack, [fallbackTrack]);
	};

	const renderSongCard = ({ item }: { item: MusicItem }) => (
		<TouchableOpacity style={styles.songCard} onPress={() => handlePlayMusicCard(item)}>
			<Image source={item.image} style={styles.songImage} />
			<Text style={styles.songTitle} numberOfLines={2}>
				{item.title}
			</Text>
			{!!item.artist && (
				<Text style={styles.songArtist} numberOfLines={1}>
					{item.artist}
				</Text>
			)}
		</TouchableOpacity>
	);

	const handleOpenArtistOptions = (item: ArtistItem) => {
		setSelectedArtist(item);
		setArtistOptionsModalVisible(true);
	};

	const handleOpenAlbumOptions = (item: AlbumItem) => {
		setSelectedAlbum(item);
		setAlbumOptionsModalVisible(true);
	};

	const renderArtistCard = ({ item }: { item: ArtistItem }) => (
		<TouchableOpacity
			style={styles.artistCard}
			onPress={() =>
				onArtistPress?.({
					...item,
					totalDuration: item.totalDuration || '01:25:43 mins',
				})
			}
		>
			<Image source={item.image} style={styles.artistImage} />
			<Text style={styles.artistName} numberOfLines={1}>
				{item.name}
			</Text>
		</TouchableOpacity>
	);

	const renderArtistRow = ({ item }: { item: ArtistItem }) => (
		<TouchableOpacity
			style={styles.artistRowContainer}
			onPress={() =>
				onArtistPress?.({
					...item,
					totalDuration: item.totalDuration || '01:25:43 mins',
				})
			}
		>
			<Image source={item.image} style={styles.artistRowImage} />
			<View style={styles.artistRowTextContainer}>
				<Text style={styles.artistRowName} numberOfLines={1}>
					{item.name}
				</Text>
				<Text style={styles.artistRowMeta}>
					{item.albums} Album | {item.songs} Songs
				</Text>
			</View>
			<TouchableOpacity
				style={styles.artistMoreButton}
				onPress={() => handleOpenArtistOptions(item)}
			>
				<Feather name="more-vertical" size={24} color="#1A1A1A" />
			</TouchableOpacity>
		</TouchableOpacity>
	);

	const renderAlbumCard = ({ item }: { item: AlbumItem }) => (
		<TouchableOpacity
			style={styles.albumCard}
			onPress={() =>
				onAlbumPress?.({
					...item,
					totalDuration: item.totalDuration || '01:20:38 mins',
				})
			}
		>
			<View style={styles.albumCardWrapper}>
				<Image source={item.image} style={styles.albumCardImage} />
			</View>
			<View style={styles.albumTitleRow}>
				<Text style={styles.albumCardTitle} numberOfLines={1}>
					{item.title}
				</Text>
				<TouchableOpacity
					style={styles.albumMoreButton}
					onPress={() => handleOpenAlbumOptions(item)}
				>
					<Feather name="more-vertical" size={22} color="#1A1A1A" />
				</TouchableOpacity>
			</View>
			<Text style={styles.albumCardMeta} numberOfLines={1}>
				{item.artist} | {item.year}
			</Text>
			<Text style={styles.albumCardSongs}>
				{item.songs} songs
			</Text>
		</TouchableOpacity>
	);

	const handleOpenSongOptions = (item: SongListItem) => {
		setSelectedSong(item);
		setOptionsModalVisible(true);
	};

	const queueFromSongs = (): PlayerTrack[] =>
		songsData.map((song) => ({
			id: song.id,
			title: song.title,
			artist: song.artist,
			image: song.image,
			url: song.url,
		}));

	const renderSongsRow = ({ item }: { item: SongListItem }) => {
		const isPlaying = playingSongId === item.id;

		return (
			<View style={styles.songsRow}>
				<Image source={item.image} style={styles.songsRowImage} />

				<View style={styles.songsTextContainer}>
					<Text style={styles.songsTitle} numberOfLines={1}>
						{item.title}
					</Text>
					<Text style={styles.songsMeta} numberOfLines={1}>
						{item.artist} {'  |  '} {item.duration}
					</Text>
				</View>

				<TouchableOpacity
					style={styles.playButton}
					onPress={() => {
						setPlayingSongId(isPlaying ? '' : item.id);
						onPlaySong?.(
							{
								id: item.id,
								title: item.title,
								artist: item.artist,
								image: item.image,
								url: item.url,
							},
							queueFromSongs(),
						);
					}}
				>
					<Ionicons
						name={isPlaying ? 'pause' : 'play'}
						size={24}
						color={colors.primary}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.moreButton}
					onPress={() => handleOpenSongOptions(item)}
				>
					<Feather name="more-vertical" size={24} color="#1A1A1A" />
				</TouchableOpacity>
			</View>
		);
	};

	const renderSuggestedTab = () => (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.scrollContent}
		>
			<View style={styles.section}>
				<SectionHeader
					title="Recently Played"
					onSeeAllPress={() => handleSeeAllPress('Songs')}
				/>
				<FlatList
					data={recentlyPlayed}
					renderItem={renderSongCard}
					keyExtractor={(item) => item.id}
					horizontal
					nestedScrollEnabled
					onTouchStart={handleHorizontalListScrollStart}
					onScrollBeginDrag={handleHorizontalListScrollStart}
					onScrollEndDrag={handleHorizontalListScrollEnd}
					onMomentumScrollEnd={handleHorizontalListScrollEnd}
					onTouchEnd={handleHorizontalListScrollEnd}
					onTouchCancel={handleHorizontalListScrollEnd}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			</View>
			
			<View style={styles.section}>
				<SectionHeader
					title="Most Played"
					onSeeAllPress={() => handleSeeAllPress('Albums')}
				/>
				<FlatList
					data={mostPlayed}
					renderItem={renderSongCard}
					keyExtractor={(item) => item.id}
					horizontal
					nestedScrollEnabled
					onTouchStart={handleHorizontalListScrollStart}
					onScrollBeginDrag={handleHorizontalListScrollStart}
					onScrollEndDrag={handleHorizontalListScrollEnd}
					onMomentumScrollEnd={handleHorizontalListScrollEnd}
					onTouchEnd={handleHorizontalListScrollEnd}
					onTouchCancel={handleHorizontalListScrollEnd}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			</View>

			<View style={styles.section}>
				<SectionHeader
					title="Artists"
					onSeeAllPress={() => handleSeeAllPress('Artists')}
				/>
				<FlatList
					data={artistsData}
					renderItem={renderArtistCard}
					keyExtractor={(item) => item.id}
					horizontal
					nestedScrollEnabled
					onTouchStart={handleHorizontalListScrollStart}
					onScrollBeginDrag={handleHorizontalListScrollStart}
					onScrollEndDrag={handleHorizontalListScrollEnd}
					onMomentumScrollEnd={handleHorizontalListScrollEnd}
					onTouchEnd={handleHorizontalListScrollEnd}
					onTouchCancel={handleHorizontalListScrollEnd}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			</View>
			
			<View style={styles.section}>
				<SectionHeader
					title="Albums"
					onSeeAllPress={() => handleSeeAllPress('Albums')}
				/>
				<FlatList
					data={albumsData}
					renderItem={renderAlbumCard}
					keyExtractor={(item) => item.id}
					horizontal
					nestedScrollEnabled
					onTouchStart={handleHorizontalListScrollStart}
					onScrollBeginDrag={handleHorizontalListScrollStart}
					onScrollEndDrag={handleHorizontalListScrollEnd}
					onMomentumScrollEnd={handleHorizontalListScrollEnd}
					onTouchEnd={handleHorizontalListScrollEnd}
					onTouchCancel={handleHorizontalListScrollEnd}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			</View>
		</ScrollView>
	);

	const renderSongsTab = () => (
		<View style={styles.songsTabContainer}>
			<View style={styles.songsHeaderRow}>
				<Text style={styles.songCountText}>{songsData.length} songs</Text>
				<TouchableOpacity
					style={styles.sortButton}
					onPress={() => setSortModalVisible(true)}
				>
					<Text style={styles.sortButtonText}>{currentSort}</Text>
					<Ionicons name="swap-vertical" size={22} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<FlatList
				data={songsData}
				renderItem={renderSongsRow}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.songsListContent}
			/>
		</View>
	);

	const renderArtistsTab = () => (
		<View style={styles.artistsTabContainer}>
			<View style={styles.artistsHeaderRow}>
				<Text style={styles.artistCountText}>{artistsData.length} artists</Text>
				<TouchableOpacity
					style={styles.sortButton}
					onPress={() => setSortModalVisible(true)}
				>
					<Text style={styles.sortButtonText}>{currentSort}</Text>
					<Ionicons name="swap-vertical" size={22} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<FlatList
				data={artistsData}
				renderItem={renderArtistRow}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.artistsListContent}
			/>
		</View>
	);

	const renderAlbumsTab = () => (
		<View style={styles.albumsTabContainer}>
			<View style={styles.albumsHeaderRow}>
				<Text style={styles.albumCountText}>{albumsData.length} albums</Text>
				<TouchableOpacity
					style={styles.sortButton}
					onPress={() => setSortModalVisible(true)}
				>
					<Text style={styles.sortButtonText}>{currentSort}</Text>
					<Ionicons name="swap-vertical" size={22} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<FlatList
				data={albumsData}
				renderItem={renderAlbumCard}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				numColumns={2}
				columnWrapperStyle={styles.albumsGridWrapper}
				contentContainerStyle={styles.albumsListContent}
			/>
		</View>
	);

	return (
		<SafeAreaView style={styles.screen}>
			<Header onSearchPress={onSearchPress} />
			<TabBar tabs={tabs} activeTab={activeTab} onTabPress={(tab) => handleChangeTab(tab as HomeTab)} />

			<ScrollView
				ref={pagerRef}
				horizontal
				scrollEnabled={isPagerScrollEnabled}
				pagingEnabled
				directionalLockEnabled
				decelerationRate="fast"
				showsHorizontalScrollIndicator={false}
				overScrollMode="never"
				scrollEventThrottle={16}
				onMomentumScrollEnd={handlePagerEnd}
				style={styles.pager}
			>
				<View style={[styles.pagerPage, { width }]}>{renderSuggestedTab()}</View>
				<View style={[styles.pagerPage, { width }]}>{renderSongsTab()}</View>
				<View style={[styles.pagerPage, { width }]}>{renderArtistsTab()}</View>
				<View style={[styles.pagerPage, { width }]}>{renderAlbumsTab()}</View>
			</ScrollView>

			<Modal
				visible={isSortModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setSortModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setSortModalVisible(false)}
				>
					<View style={styles.sortModalCard}>
						{sortOptions.map((option) => {
							const isSelected = option === currentSort;

							return (
								<TouchableOpacity
									key={option}
									style={styles.sortOptionRow}
									onPress={() => applySortForActiveTab(option)}
								>
									<Text style={styles.sortOptionText}>{option}</Text>
									<View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
										{isSelected && <View style={styles.radioInner} />}
									</View>
								</TouchableOpacity>
							);
						})}
					</View>
				</TouchableOpacity>
			</Modal>

			<Modal
				visible={isOptionsModalVisible}
				transparent
				animationType="slide"
				onRequestClose={closeSongOptions}
			>
				<TouchableOpacity
					style={styles.modalOverlayDark}
					activeOpacity={1}
					onPress={closeSongOptions}
				>
					<View style={styles.optionsSheet}>
						<View style={styles.sheetHandle} />

						{selectedSong && (
							<View style={styles.sheetSongHeader}>
								<Image source={selectedSong.image} style={styles.sheetSongImage} />
								<View style={styles.sheetSongTextWrap}>
									<Text style={styles.sheetSongTitle} numberOfLines={1}>
										{selectedSong.title}
									</Text>
									<Text style={styles.sheetSongMeta} numberOfLines={1}>
										{selectedSong.artist} {'  |  '} {selectedSong.duration}
									</Text>
								</View>
								<TouchableOpacity
									onPress={() => toggleFavourite(toPlayerTrack(selectedSong))}
								>
									<Ionicons
										name={isFavourite(selectedSong.id) ? 'heart' : 'heart-outline'}
										size={34}
										color={isFavourite(selectedSong.id) ? '#F04438' : '#1A1A1A'}
									/>
								</TouchableOpacity>
							</View>
						)}

						<View style={styles.sheetDivider} />

						<ScrollView showsVerticalScrollIndicator={false}>
							{songOptions.map((option) => (
								<TouchableOpacity
									key={option}
									style={styles.sheetOptionRow}
									onPress={() => {
										void handleSongOptionPress(option);
									}}
								>
									<Text style={styles.sheetOptionText}>{option}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</TouchableOpacity>
			</Modal>

			<Modal
				visible={isArtistOptionsModalVisible}
				transparent
				animationType="slide"
				onRequestClose={closeArtistOptions}
			>
				<TouchableOpacity
					style={styles.modalOverlayDark}
					activeOpacity={1}
					onPress={closeArtistOptions}
				>
					<View style={styles.optionsSheet}>
						<View style={styles.sheetHandle} />

						{selectedArtist && (
							<View style={styles.sheetArtistHeader}>
								<Image source={selectedArtist.image} style={styles.sheetArtistImage} />
								<View style={styles.sheetArtistTextWrap}>
									<Text style={styles.sheetArtistName} numberOfLines={1}>
										{selectedArtist.name}
									</Text>
									<Text style={styles.sheetArtistMeta} numberOfLines={1}>
										{selectedArtist.albums} Album | {selectedArtist.songs} Songs
									</Text>
								</View>
							</View>
						)}

						<View style={styles.sheetDivider} />

						<ScrollView showsVerticalScrollIndicator={false}>
							{artistOptions.map((option) => (
								<TouchableOpacity
									key={option}
									style={styles.sheetOptionRow}
									onPress={() => {
										void handleArtistOptionPress(option);
									}}
								>
									<Text style={styles.sheetOptionText}>{option}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</TouchableOpacity>
			</Modal>

			<Modal
				visible={isAlbumOptionsModalVisible}
				transparent
				animationType="slide"
				onRequestClose={closeAlbumOptions}
			>
				<TouchableOpacity
					style={styles.modalOverlayDark}
					activeOpacity={1}
					onPress={closeAlbumOptions}
				>
					<View style={styles.optionsSheet}>
						<View style={styles.sheetHandle} />

						{selectedAlbum && (
							<View style={styles.sheetAlbumHeader}>
								<Image source={selectedAlbum.image} style={styles.sheetAlbumImage} />
								<View style={styles.sheetAlbumTextWrap}>
									<Text style={styles.sheetAlbumTitle} numberOfLines={1}>
										{selectedAlbum.title}
									</Text>
									<Text style={styles.sheetAlbumMeta} numberOfLines={1}>
										{selectedAlbum.artist} | {selectedAlbum.year}
									</Text>
									<Text style={styles.sheetAlbumSongs}>
										{selectedAlbum.songs} songs
									</Text>
								</View>
							</View>
						)}

						<View style={styles.sheetDivider} />

						<ScrollView showsVerticalScrollIndicator={false}>
							{albumOptions.map((option) => (
								<TouchableOpacity
									key={option}
									style={styles.sheetOptionRow}
									onPress={() => {
										void handleAlbumOptionPress(option);
									}}
								>
									<Text style={styles.sheetOptionText}>{option}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</TouchableOpacity>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.background,
	},
	pager: {
		flex: 1,
	},
	pagerPage: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: 18,
		paddingBottom: 32,
	},
	songsTabContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 14,
	},
	songsHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 18,
		borderBottomWidth: 1,
		borderBottomColor: '#ECECEC',
		marginBottom: 6,
	},
	songCountText: {
		fontSize: 36 / 2,
		fontWeight: '700',
		color: '#171717',
	},
	sortButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	sortButtonText: {
		fontSize: 28 / 2,
		fontWeight: '700',
		color: colors.primary,
	},
	songsListContent: {
		paddingBottom: 24,
	},
	songsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
	},
	songsRowImage: {
		width: 72,
		height: 72,
		borderRadius: 22,
		backgroundColor: '#ECECEC',
		marginRight: 14,
	},
	songsTextContainer: {
		flex: 1,
	},
	songsTitle: {
		fontSize: 32 / 2,
		fontWeight: '700',
		color: '#171717',
		marginBottom: 3,
	},
	songsMeta: {
		fontSize: 22 / 2,
		color: '#666666',
	},
	playButton: {
		paddingHorizontal: 8,
	},
	moreButton: {
		paddingLeft: 6,
		paddingRight: 2,
	},
	section: {
		marginBottom: 16,
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	songCard: {
		width: 156,
		marginRight: 14,
	},
	songImage: {
		width: 156,
		height: 156,
		borderRadius: 30,
		marginBottom: 10,
		backgroundColor: '#EFEFEF',
	},
	songTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: '#1A1A1A',
		lineHeight: 23,
	},
	songArtist: {
		marginTop: 2,
		fontSize: 14,
		color: '#6F6F6F',
	},
	artistCard: {
		width: 156,
		marginRight: 14,
		alignItems: 'center',
	},
	artistImage: {
		width: 156,
		height: 156,
		borderRadius: 78,
		marginBottom: 10,
		backgroundColor: '#EFEFEF',
	},
	artistName: {
		fontSize: 17,
		fontWeight: '700',
		color: '#1A1A1A',
	},
	artistsTabContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 14,
	},
	artistsHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 18,
		borderBottomWidth: 1,
		borderBottomColor: '#ECECEC',
		marginBottom: 6,
	},
	artistCountText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#171717',
	},
	artistsListContent: {
		paddingBottom: 24,
	},
	artistRowContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F5F5F5',
	},
	artistRowImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#ECECEC',
		marginRight: 14,
	},
	artistRowTextContainer: {
		flex: 1,
	},
	artistRowName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1A1A1A',
		marginBottom: 4,
	},
	artistRowMeta: {
		fontSize: 13,
		color: '#999999',
	},
	artistMoreButton: {
		padding: 8,
	},
	sheetArtistHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 16,
	},
	sheetArtistImage: {
		width: 64,
		height: 64,
		borderRadius: 32,
		marginRight: 12,
	},
	sheetArtistTextWrap: {
		flex: 1,
	},
	sheetArtistName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#171717',
		marginBottom: 2,
	},
	sheetArtistMeta: {
		fontSize: 13,
		color: '#999999',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.12)',
	},
	sortModalCard: {
		position: 'absolute',
		top: 206,
		right: 18,
		width: 338,
		maxWidth: '88%',
		backgroundColor: '#FFFFFF',
		borderRadius: 24,
		paddingVertical: 12,
		paddingHorizontal: 18,
	},
	sortOptionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#EFEFEF',
	},
	sortOptionText: {
		fontSize: 28 / 2,
		color: '#1F1F1F',
		fontWeight: '500',
	},
	radioOuter: {
		width: 26,
		height: 26,
		borderRadius: 13,
		borderWidth: 2,
		borderColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioOuterSelected: {
		borderColor: colors.primary,
	},
	radioInner: {
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: colors.primary,
	},
	modalOverlayDark: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.48)',
		justifyContent: 'flex-end',
	},
	optionsSheet: {
		height: '78%',
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 34,
		borderTopRightRadius: 34,
		paddingHorizontal: 16,
		paddingTop: 10,
	},
	sheetHandle: {
		width: 54,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#DDDDDD',
		alignSelf: 'center',
		marginBottom: 16,
	},
	sheetSongHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 16,
	},
	sheetSongImage: {
		width: 64,
		height: 64,
		borderRadius: 20,
		marginRight: 12,
	},
	sheetSongTextWrap: {
		flex: 1,
	},
	sheetSongTitle: {
		fontSize: 32 / 2,
		fontWeight: '700',
		color: '#171717',
		marginBottom: 2,
	},
	sheetSongMeta: {
		fontSize: 22 / 2,
		color: '#6A6A6A',
	},
	sheetDivider: {
		height: 1,
		backgroundColor: '#EFEFEF',
		marginBottom: 8,
	},
	sheetOptionRow: {
		paddingVertical: 13,
	},
	sheetOptionText: {
		fontSize: 28 / 2,
		fontWeight: '500',
		color: '#1E1E1E',
	},
	albumsTabContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingBottom: 8,
		paddingTop: 14,
	},
	albumsHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 18,
		borderBottomWidth: 1,
		borderBottomColor: '#ECECEC',
		marginBottom: 6,
	},
	albumCountText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#171717',
	},
	albumsListContent: {
		paddingBottom: 24,
	},
	albumsGridWrapper: {
		justifyContent: 'space-between',
		columnGap: 14,
	},
	albumCard: {
		flex: 1,
		marginBottom: 20,
	},
	albumCardWrapper: {
		marginBottom: 12,
	},
	albumCardImage: {
		width: 156,
		height: 156,
		aspectRatio: 1,
		borderRadius: 34,
		backgroundColor: '#ECECEC',
	},
	albumTitleRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		marginBottom: 2,
	},
	albumCardTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1A1A1A',
		flex: 1,
		paddingRight: 8,
		lineHeight: 22,
	},
	albumMoreButton: {
		paddingTop: 2,
		paddingHorizontal: 4,
	},
	albumCardMeta: {
		fontSize: 13,
		color: '#999999',
		marginBottom: 2,
	},
	albumCardSongs: {
		fontSize: 13,
		color: '#ACACAC',
	},
	sheetAlbumHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 16,
	},
	sheetAlbumImage: {
		width: 64,
		height: 64,
		borderRadius: 14,
		marginRight: 12,
	},
	sheetAlbumTextWrap: {
		flex: 1,
	},
	sheetAlbumTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#171717',
		marginBottom: 2,
	},
	sheetAlbumMeta: {
		fontSize: 13,
		color: '#999999',
		marginBottom: 3,
	},
	sheetAlbumSongs: {
		fontSize: 13,
		color: '#ACACAC',
	},
});

export default HomeScreen;
