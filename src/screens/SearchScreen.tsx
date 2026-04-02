import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Alert,
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Text,
	Image,
	FlatList,
	ActivityIndicator,
	Share,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useThemeColors } from '../theme/colors';
import { searchSongs, searchArtists, searchAlbums, SearchResult, getArtistName, formatDuration } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/playerStore';
import { PlayerTrack } from '../components/Player';
import { useLibraryStore } from '../store/libraryStore';
import OptionsSheetModal, { OptionSheetAction } from '../components/OptionsSheetModal';

type SearchFilter = 'Songs' | 'Artists' | 'Albums' | 'Folders';

interface SearchScreenProps {
	onBackPress?: () => void;
}

const INITIAL_RECENT_SEARCHES = ['Ariana Grande', 'Morgan Wallen', 'Justin Bieber', 'Drake', 'Olivia Rodrigo', 'The Weeknd', 'Taylor Swift', 'Juice WRLD', 'Memories'];
const SEARCH_DEBOUNCE_MS = 300;

interface SongItem {
	id: string;
	title: string;
	subtitle: string;
	image: { uri: string };
	artist?: string;
	duration?: string;
	url?: string;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onBackPress }) => {
	const theme = useThemeColors();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeFilter, setActiveFilter] = useState<SearchFilter>('Songs');
	const [isLoading, setIsLoading] = useState(false);
	const [results, setResults] = useState<SongItem[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [recentSearches, setRecentSearches] = useState<string[]>(INITIAL_RECENT_SEARCHES);
	const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
	const [selectedOptionItem, setSelectedOptionItem] = useState<SongItem | null>(null);
	const [optionsMode, setOptionsMode] = useState<'song' | 'entity'>('song');
	const playSong = usePlayerStore((state) => state.playSong);
	const addToQueue = usePlayerStore((state) => state.addToQueue);
	const addToQueueNext = usePlayerStore((state) => state.addToQueueNext);
	const downloadTrack = usePlayerStore((state) => state.downloadTrack);
	const removeDownloadedTrack = usePlayerStore((state) => state.removeDownloadedTrack);
	const isTrackDownloaded = usePlayerStore((state) => state.isTrackDownloaded);
	const playlists = useLibraryStore((state) => state.playlists);
	const toggleFavourite = useLibraryStore((state) => state.toggleFavourite);
	const addTrackToPlaylist = useLibraryStore((state) => state.addTrackToPlaylist);
	const primaryPlaylist = playlists[0];

	const filters: SearchFilter[] = ['Songs', 'Artists', 'Albums', 'Folders'];

	const performSearch = useCallback(async (text: string, filter: SearchFilter) => {
		if (text.trim() === '') {
			setResults([]);
			setHasSearched(false);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setHasSearched(true);

		try {
			switch (filter) {
				case 'Songs': {
					const songs = await searchSongs(text);
					const formattedSongs = songs.map((song: SearchResult) => ({
						id: song.id,
						title: song.title,
						artist: getArtistName(song),
						duration: formatDuration(song.duration),
						subtitle: `${getArtistName(song)}  |  ${formatDuration(song.duration)}`,
						image: { uri: song.image || 'https://via.placeholder.com/100' },
						url: song.url,
					}));

					setResults(formattedSongs);
					break;
				}
				case 'Artists': {
					const artists = await searchArtists(text);
					setResults(
						artists.map((artist: SearchResult) => ({
							id: artist.id,
							title: artist.title,
							subtitle: artist.description || 'Artist',
							image: { uri: artist.image || 'https://via.placeholder.com/100' },
						})),
					);
					break;
				}
				case 'Albums': {
					const albums = await searchAlbums(text);
					setResults(
						albums.map((album: SearchResult) => ({
							id: album.id,
							title: album.title,
							subtitle: album.description || 'Album',
							image: { uri: album.image || 'https://via.placeholder.com/100' },
						})),
					);
					break;
				}
				default:
					setResults([]);
			}
		} catch (error) {
			console.error('Search error:', error);
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const trimmedQuery = searchQuery.trim();
		if (!trimmedQuery) {
			setResults([]);
			setHasSearched(false);
			setIsLoading(false);
			return;
		}

		const timeoutId = setTimeout(() => {
			void performSearch(trimmedQuery, activeFilter);
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [activeFilter, performSearch, searchQuery]);

	const handleFilterChange = (filter: SearchFilter) => {
		setActiveFilter(filter);
	};

	const handleRecentSearchClick = (search: string) => {
		setSearchQuery(search);
		// Add to recent searches if not already there
		setRecentSearches((prev) => {
			const filtered = prev.filter((s) => s !== search);
			return [search, ...filtered].slice(0, 9);
		});
	};

	const handleRemoveRecentSearch = (search: string) => {
		setRecentSearches((prev) => prev.filter((s) => s !== search));
	};

	const handleClearAllRecentSearches = () => {
		setRecentSearches([]);
	};

	const resultsQueue = useMemo(
		() => results
			.filter((result): result is SongItem => Boolean(result?.url && result?.id))
			.map((result) => ({
				id: result.id,
				title: result.title,
				artist: result.artist || 'Unknown Artist',
				image: result.image,
				url: result.url,
			})),
		[results],
	);

	const handlePlaySong = useCallback((item: SongItem) => {
		if (!item.url) {
			return;
		}

		const selectedTrack: PlayerTrack = {
			id: item.id,
			title: item.title,
			artist: item.artist || 'Unknown Artist',
			image: item.image,
			url: item.url,
		};

		playSong(selectedTrack, resultsQueue.length ? resultsQueue : [selectedTrack]);
	}, [playSong, resultsQueue]);

	const toPlayerTrack = (item: SongItem): PlayerTrack => ({
		id: item.id,
		title: item.title,
		artist: item.artist || 'Unknown Artist',
		image: item.image,
		url: item.url,
	});

	const closeOptionsModal = () => {
		setOptionsModalVisible(false);
		setSelectedOptionItem(null);
	};

	const openSongOptions = (item: SongItem) => {
		setOptionsMode('song');
		setSelectedOptionItem(item);
		setOptionsModalVisible(true);
	};

	const openArtistOrAlbumOptions = (item: SongItem) => {
		setOptionsMode('entity');
		setSelectedOptionItem(item);
		setOptionsModalVisible(true);
	};

	const getSongOptions = (item: SongItem): OptionSheetAction[] => [
		{ key: 'play', label: 'Play', onPress: () => handlePlaySong(item) },
		{
			key: 'play-next',
			label: 'Play Next',
			onPress: () => {
				if (item.url) {
					addToQueueNext(toPlayerTrack(item));
				}
			},
		},
		{
			key: 'add-queue',
			label: 'Add to Queue',
			onPress: () => {
				if (item.url) {
					addToQueue(toPlayerTrack(item));
				}
			},
		},
		{
			key: 'add-playlist',
			label: 'Add to Playlist',
			onPress: () => {
				if (item.url && primaryPlaylist) {
					addTrackToPlaylist(primaryPlaylist.id, toPlayerTrack(item));
				}
			},
		},
		{
			key: 'toggle-favourite',
			label: 'Toggle Favourite',
			onPress: () => {
				if (item.url) {
					toggleFavourite(toPlayerTrack(item));
				}
			},
		},
		{
			key: 'offline-toggle',
			label: isTrackDownloaded(item.id) ? 'Remove Download' : 'Download for Offline',
			onPress: () => {
				if (isTrackDownloaded(item.id)) {
					void removeDownloadedTrack(item.id);
					return;
				}

				if (!item.url) {
					Alert.alert('Download unavailable', 'This song cannot be downloaded right now.');
					return;
				}

				void downloadTrack(toPlayerTrack(item));
			},
		},
		{
			key: 'share',
			label: 'Share',
			onPress: () => {
				void Share.share({ message: `${item.title} - ${item.subtitle}` });
			},
		},
	];

	const getEntityOptions = (item: SongItem): OptionSheetAction[] => [
		{
			key: 'show-songs',
			label: 'Show Songs',
			onPress: () => {
				setActiveFilter('Songs');
				setSearchQuery(`${item.title} songs`);
			},
		},
		{
			key: 'share',
			label: 'Share',
			onPress: () => {
				void Share.share({ message: `${item.title} on Lokal Music Player` });
			},
		},
	];

	const handleResultPress = (item: SongItem) => {
		if (activeFilter === 'Songs') {
			handlePlaySong(item);
			return;
		}

		setActiveFilter('Songs');
		setSearchQuery(`${item.title} songs`);
	};

	const optionActions = selectedOptionItem
		? optionsMode === 'song'
			? getSongOptions(selectedOptionItem)
			: getEntityOptions(selectedOptionItem)
		: [];

	const optionSubtitle = selectedOptionItem
		? optionsMode === 'song'
			? selectedOptionItem.subtitle
			: selectedOptionItem.subtitle || 'Browse related songs'
		: undefined;

	const renderSearchResult = useCallback(({ item }: { item: SongItem }) => (
		<TouchableOpacity style={[styles.resultRow, { borderBottomColor: theme.border }]} onPress={() => handleResultPress(item)}>
			<Image source={item.image} style={[styles.resultImage, { backgroundColor: theme.imagePlaceholder }]} />
			<View style={styles.resultTextContainer}>
				<Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>
					{item.title}
				</Text>
				<Text style={[styles.resultSubtitle, { color: theme.subText }]} numberOfLines={1}>
					{item.subtitle}
				</Text>
			</View>
			<TouchableOpacity
				style={styles.playButton}
				onPress={() => handlePlaySong(item)}
				disabled={activeFilter !== 'Songs' || !item.url}
			>
				<Ionicons name="play-circle" size={36} color={theme.primary} />
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.moreButton}
				onPress={() => {
					if (activeFilter === 'Songs') {
						openSongOptions(item);
						return;
					}

					openArtistOrAlbumOptions(item);
				}}
			>
				<Feather name="more-vertical" size={20} color={theme.icon} />
			</TouchableOpacity>
		</TouchableOpacity>
	), [activeFilter, handlePlaySong, theme.border, theme.icon, theme.imagePlaceholder, theme.primary, theme.subText, theme.text]);

	const resultKeyExtractor = useCallback((item: SongItem, index: number) => item.id || index.toString(), []);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
			{/* Search Header */}
			<View style={styles.searchHeader}>
				<TouchableOpacity onPress={onBackPress}>
					<Ionicons name="chevron-back" size={28} color={theme.icon} />
				</TouchableOpacity>
				<View style={[styles.searchInputContainer, { backgroundColor: theme.inputBackground }]}> 
					<Ionicons name="search" size={18} color={theme.subText} />
					<TextInput
						style={[styles.searchInput, { color: theme.text }]}
						placeholder="Search songs, artists..."
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholderTextColor={theme.subText}
						autoFocus
					/>
					{searchQuery ? (
						<TouchableOpacity onPress={() => setSearchQuery('')}>
							<Ionicons name="close-circle" size={20} color={theme.subText} />
						</TouchableOpacity>
					) : null}
				</View>
			</View>

			{/* Filter Tabs - Only show when searched */}
			{hasSearched && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.filterContainer}
					contentContainerStyle={styles.filterContent}
				>
					{filters.map((filter) => (
						<TouchableOpacity
							key={filter}
							style={[
								styles.filterButton,
								{ borderColor: theme.primary },
								activeFilter === filter && styles.filterButtonActive,
								activeFilter === filter && { backgroundColor: theme.primary },
							]}
							onPress={() => handleFilterChange(filter)}
						>
							<Text
								style={[
									styles.filterText,
									{ color: theme.primary },
									activeFilter === filter && styles.filterTextActive,
								]}
							>
								{filter}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}

			{/* Results or Recent Searches */}
			<ScrollView style={[styles.resultsContainer, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
				{isLoading ? (
					<View style={styles.loaderContainer}>
						<ActivityIndicator size="large" color={theme.primary} />
					</View>
				) : !hasSearched ? (
					<View style={styles.recentSearchesContainer}>
						<View style={styles.recentHeader}>
							<Text style={[styles.recentTitle, { color: theme.text }]}>Recent Searches</Text>
							{recentSearches.length > 0 && (
								<TouchableOpacity onPress={handleClearAllRecentSearches}>
									<Text style={[styles.clearAllText, { color: theme.primary }]}>Clear All</Text>
								</TouchableOpacity>
							)}
						</View>
						{recentSearches.length === 0 ? (
							<Text style={[styles.noRecentText, { color: theme.subText }]}>No recent searches</Text>
						) : (
							recentSearches.map((search, index) => (
								<TouchableOpacity
									key={index}
									style={[styles.recentSearchRow, { borderBottomColor: theme.border }]}
									onPress={() => handleRecentSearchClick(search)}
									activeOpacity={0.7}
								>
									<Text style={[styles.recentSearchText, { color: theme.subText }]}>{search}</Text>
									<TouchableOpacity
										onPress={() => handleRemoveRecentSearch(search)}
										style={styles.removeButton}
									>
										<Ionicons name="close" size={20} color={theme.subText} />
									</TouchableOpacity>
								</TouchableOpacity>
							))
						)}
					</View>
				) : results.length === 0 ? (
					<View style={styles.notFoundContainer}>
						<View style={[styles.sadEmojiBackground, { backgroundColor: theme.primary }]}> 
							<Text style={styles.sadEmoji}>😢</Text>
						</View>
						<Text style={[styles.notFoundTitle, { color: theme.text }]}>Not Found</Text>
						<Text style={[styles.notFoundText, { color: theme.subText }]}> 
							Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
						</Text>
					</View>
				) : (
					<FlatList
						data={results}
						renderItem={renderSearchResult}
						keyExtractor={resultKeyExtractor}
						removeClippedSubviews
						initialNumToRender={10}
						maxToRenderPerBatch={10}
						windowSize={7}
						scrollEnabled={false}
						contentContainerStyle={styles.resultsList}
					/>
				)}
			</ScrollView>

			<OptionsSheetModal
				visible={isOptionsModalVisible && !!selectedOptionItem}
				onClose={closeOptionsModal}
				title={selectedOptionItem?.title}
				subtitle={optionSubtitle}
				image={selectedOptionItem?.image}
				options={optionActions}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	searchHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	searchInputContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 12,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 20,
	},
	searchInput: {
		flex: 1,
		marginHorizontal: 8,
		fontSize: 14,
		padding: 0,
	},
	filterContainer: {
		maxHeight: 40,
		top: 4,
	},
	filterContent: {
		paddingHorizontal: 16,
		gap: 10,
	},
	filterButton: {
		paddingHorizontal: 18,
		paddingVertical: 8,
		borderWidth: 1.5,
		borderRadius: 20,
		backgroundColor: 'transparent',
	},
	filterButtonActive: {
	},
	filterText: {
		fontSize: 14,
		fontWeight: '600',
	},
	filterTextActive: {
		color: '#FFFFFF',
	},
	resultsContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	loaderContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 48,
	},
	recentSearchesContainer: {
		paddingVertical: 16,
	},
	recentHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	recentTitle: {
		fontSize: 18,
		fontWeight: '700',
	},
	clearAllText: {
		fontSize: 14,
		fontWeight: '600',
	},
	noRecentText: {
		fontSize: 14,
		textAlign: 'center',
		paddingVertical: 24,
	},
	recentSearchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		borderBottomWidth: 1,
	},
	recentSearchText: {
		fontSize: 14,
	},
	removeButton: {
		padding: 4,
	},
	resultsList: {
		paddingVertical: 12,
	},
	resultRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	resultImage: {
		width: 72,
		height: 72,
		borderRadius: 16,
		marginRight: 12,
	},
	resultTextContainer: {
		flex: 1,
	},
	resultTitle: {
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 3,
	},
	resultSubtitle: {
		fontSize: 12,
	},
	playButton: {
		marginHorizontal: 8,
	},
	moreButton: {
		padding: 8,
		marginLeft: 4,
	},
	notFoundContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 48,
	},
	sadEmojiBackground: {
		width: 120,
		height: 120,
		borderRadius: 60,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 24,
	},
	sadEmoji: {
		fontSize: 60,
	},
	notFoundTitle: {
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 8,
	},
	notFoundText: {
		fontSize: 14,
		textAlign: 'center',
		paddingHorizontal: 24,
		lineHeight: 20,
	},
});

export default SearchScreen;
