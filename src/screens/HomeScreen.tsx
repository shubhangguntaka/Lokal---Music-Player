import React, { useState } from 'react';
import {
	FlatList,
	Image,
	ImageSourcePropType,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { PlayerTrack } from '../components/Player';
import SectionHeader from '../components/SectionHeader';
import TabBar from '../components/TabBar';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

type MusicItem = {
	id: string;
	title: string;
	artist?: string;
	image: ImageSourcePropType;
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

const tabs = ['Suggested', 'Songs', 'Artists', 'Albums'];

const albumArtwork = require('../../assets/icon.png');
const artistArtwork = require('../../assets/adaptive-icon.png');
const altArtwork = require('../../assets/splash-icon.png');

const recentlyPlayed: MusicItem[] = [
	{ id: '1', title: 'Shades of Love', artist: 'Ania Szarmach', image: albumArtwork },
	{ id: '2', title: 'Without You', artist: 'The Kid LAROI', image: altArtwork },
	{ id: '3', title: 'Save Your Tears', artist: 'The Weeknd', image: albumArtwork },
	{ id: '4', title: 'Heat Waves', artist: 'Glass Animals', image: altArtwork },
];

const artists: ArtistItem[] = [
	{ id: '1', name: 'Ariana Grande', image: artistArtwork, albums: 1, songs: 20 },
	{ id: '2', name: 'The Weeknd', image: albumArtwork, albums: 1, songs: 16 },
	{ id: '3', name: 'Acidrap', image: altArtwork, albums: 2, songs: 28 },
	{ id: '4', name: 'Ania Szarmach', image: albumArtwork, albums: 1, songs: 12 },
	{ id: '5', name: 'Troye Sivan', image: altArtwork, albums: 1, songs: 14 },
	{ id: '6', name: 'Ryan Jones', image: artistArtwork, albums: 2, songs: 24 },
];

const mostPlayed: MusicItem[] = [
	{ id: '1', title: 'Photograph', artist: 'Ed Sheeran', image: altArtwork },
	{ id: '2', title: 'Night Drive', artist: 'LANY', image: albumArtwork },
	{ id: '3', title: 'Somebody Else', artist: 'The 1975', image: altArtwork },
	{ id: '4', title: 'Afterglow', artist: 'Taylor Swift', image: albumArtwork },
];

const songsData: SongListItem[] = [
	{ id: '1', title: 'Starboy', artist: 'The Weeknd, Daft Punk', duration: '03:50 mins', image: albumArtwork, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
	{ id: '2', title: 'Disaster', artist: 'Conan Gray', duration: '03:58 mins', image: altArtwork, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
	{ id: '3', title: 'HANDSOME', artist: 'Warren Hue', duration: '04:45 mins', image: artistArtwork, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
	{ id: '4', title: 'Sharks', artist: 'Imagine Dragons', duration: '05:23 mins', image: albumArtwork, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
	{ id: '5', title: 'Fly Me To The Sun', artist: 'Romantic Echoes', duration: '04:20 mins', image: artistArtwork, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
	{ id: '6', title: 'The Bended Man', artist: 'Sunwich', duration: '03:48 mins', image: altArtwork, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
];

const albumsData: AlbumItem[] = [
	{ id: '1', title: 'Dawn FM', artist: 'The Weeknd', year: 2022, songs: 16, image: albumArtwork },
	{ id: '2', title: 'Sweetener', artist: 'Ariana Grande', year: 2021, songs: 16, image: altArtwork },
	{ id: '3', title: 'First Impact', artist: 'Treasure', year: 2021, songs: 14, image: artistArtwork },
	{ id: '4', title: 'Pain (Official)', artist: 'Ryan Jones', year: 2021, songs: 18, image: albumArtwork },
	{ id: '5', title: 'Lover', artist: 'Taylor Swift', year: 2019, songs: 18, image: altArtwork },
	{ id: '6', title: 'KHIPU', artist: 'Acidrap', year: 2023, songs: 22, image: artistArtwork },
	{ id: '7', title: 'Fine Line', artist: 'Harry Styles', year: 2019, songs: 13, image: albumArtwork },
	{ id: '8', title: 'Midnights', artist: 'Taylor Swift', year: 2022, songs: 19, image: altArtwork },
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
	const [currentSort, setCurrentSort] = useState('Ascending');
	const [playingSongId, setPlayingSongId] = useState('');
	const [isSortModalVisible, setSortModalVisible] = useState(false);
	const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
	const [isArtistOptionsModalVisible, setArtistOptionsModalVisible] = useState(false);
	const [isAlbumOptionsModalVisible, setAlbumOptionsModalVisible] = useState(false);
	const [selectedSong, setSelectedSong] = useState<SongListItem | null>(null);
	const [selectedArtist, setSelectedArtist] = useState<ArtistItem | null>(null);
	const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);

	const handleSeeAllPress = (tab: HomeTab) => {
		setActiveTab(tab);
	};

	const renderSongCard = ({ item }: { item: MusicItem }) => (
		<TouchableOpacity style={styles.songCard}>
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
					data={artists}
					renderItem={renderArtistCard}
					keyExtractor={(item) => item.id}
					horizontal
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
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			</View>
		</ScrollView>
	);

	const renderSongsTab = () => (
		<View style={styles.songsTabContainer}>
			<View style={styles.songsHeaderRow}>
				<Text style={styles.songCountText}>560 songs</Text>
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
				<Text style={styles.artistCountText}>{artists.length} artists</Text>
				<TouchableOpacity
					style={styles.sortButton}
					onPress={() => setSortModalVisible(true)}
				>
					<Text style={styles.sortButtonText}>{currentSort}</Text>
					<Ionicons name="swap-vertical" size={22} color={colors.primary} />
				</TouchableOpacity>
			</View>

			<FlatList
				data={artists}
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
					<Text style={styles.sortButtonText}>Date Modified</Text>
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
			<TabBar tabs={tabs} activeTab={activeTab} onTabPress={(tab) => setActiveTab(tab as HomeTab)} />

			{activeTab === 'Songs' && renderSongsTab()}
			{activeTab === 'Artists' && renderArtistsTab()}
			{activeTab === 'Suggested' && renderSuggestedTab()}
			{activeTab === 'Albums' && renderAlbumsTab()}

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
									onPress={() => {
										setCurrentSort(option);
										setSortModalVisible(false);
									}}
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
				onRequestClose={() => setOptionsModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlayDark}
					activeOpacity={1}
					onPress={() => setOptionsModalVisible(false)}
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
								<Ionicons name="heart-outline" size={34} color="#1A1A1A" />
							</View>
						)}

						<View style={styles.sheetDivider} />

						<ScrollView showsVerticalScrollIndicator={false}>
							{songOptions.map((option) => (
								<TouchableOpacity
									key={option}
									style={styles.sheetOptionRow}
									onPress={() => setOptionsModalVisible(false)}
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
				onRequestClose={() => setArtistOptionsModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlayDark}
					activeOpacity={1}
					onPress={() => setArtistOptionsModalVisible(false)}
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
									onPress={() => setArtistOptionsModalVisible(false)}
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
				onRequestClose={() => setAlbumOptionsModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlayDark}
					activeOpacity={1}
					onPress={() => setAlbumOptionsModalVisible(false)}
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
									onPress={() => setAlbumOptionsModalVisible(false)}
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
		fontSize: 21 / 2,
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
		fontSize: 19 / 2,
		fontWeight: '700',
		color: '#171717',
		marginBottom: 2,
	},
	sheetSongMeta: {
		fontSize: 16 / 2,
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
		fontSize: 21 / 2,
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
		fontSize: 16,
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
