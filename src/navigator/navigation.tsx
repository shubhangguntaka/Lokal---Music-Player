import React, { useCallback, useState } from 'react';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import {
	NavigationContainer,
	useNavigationContainerRef,
} from '@react-navigation/native';
import {
	createNativeStackNavigator,
	NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import BottomNavBar, { BottomTab } from '../components/BottomNavBar';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import AlbumsScreen from '../screens/AlbumsScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { PlayerTrack } from '../components/Player';

export type ArtistDetailParams = {
	id: string;
	name: string;
	image: ImageSourcePropType;
	albums: number;
	songs: number;
	totalDuration?: string;
};

export type AlbumDetailParams = {
	id: string;
	title: string;
	image: ImageSourcePropType;
	artist: string;
	year: number;
	songs: number;
	totalDuration?: string;
};

export type RootStackParamList = {
	Tabs: undefined;
	Search: undefined;
	ArtistDetail: ArtistDetailParams;
	AlbumDetail: AlbumDetailParams;
};

type AppNavigationProps = {
	onPlaySong: (song: PlayerTrack, queue: PlayerTrack[]) => void;
	onTabsRouteChange?: (isTabsRoute: boolean) => void;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

type MainTabsShellProps = {
	navigation: NativeStackNavigationProp<RootStackParamList>;
	onPlaySong: (song: PlayerTrack, queue: PlayerTrack[]) => void;
};

const MainTabsShell: React.FC<MainTabsShellProps> = ({
	navigation,
	onPlaySong,
}) => {
	const [activeTab, setActiveTab] = useState<BottomTab>('Home');

	const renderTabScreen = () => {
		switch (activeTab) {
			case 'Favorites':
				return <FavouritesScreen />;
			case 'Playlists':
				return <PlaylistsScreen />;
			case 'Settings':
				return <SettingsScreen />;
			case 'Home':
			default:
				return (
					<HomeScreen
						onSearchPress={() => navigation.navigate('Search')}
						onPlaySong={onPlaySong}
						onArtistPress={(artist) =>
							navigation.navigate('ArtistDetail', {
								id: artist.id,
								name: artist.name,
								image: artist.image,
								albums: artist.albums,
								songs: artist.songs,
								totalDuration: artist.totalDuration,
							})
						}
						onAlbumPress={(album) =>
							navigation.navigate('AlbumDetail', {
								id: album.id,
								title: album.title,
								image: album.image,
								artist: album.artist,
								year: album.year,
								songs: album.songs,
								totalDuration: album.totalDuration,
							})
						}
					/>
				);
		}
	};

	return (
		<View style={styles.mainScreenLayout}>
			<View style={styles.mainScreenContent}>{renderTabScreen()}</View>
			<BottomNavBar
				activeTab={activeTab}
				onTabPress={setActiveTab}
			/>
		</View>
	);
};

const AppNavigation: React.FC<AppNavigationProps> = ({
	onPlaySong,
	onTabsRouteChange,
}) => {
	const navigationRef = useNavigationContainerRef<RootStackParamList>();

	const handleNavigationState = useCallback(() => {
		const currentRoute = navigationRef.getCurrentRoute();
		const isTabsRoute = currentRoute?.name === 'Tabs';

		onTabsRouteChange?.(Boolean(isTabsRoute));
	}, [navigationRef, onTabsRouteChange]);

	return (
		<NavigationContainer
			ref={navigationRef}
			onReady={handleNavigationState}
			onStateChange={handleNavigationState}
		>
			<RootStack.Navigator
				initialRouteName="Tabs"
				screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
			>
				<RootStack.Screen name="Tabs">
					{({ navigation }) => (
						<MainTabsShell
							navigation={navigation}
							onPlaySong={onPlaySong}
						/>
					)}
				</RootStack.Screen>
				<RootStack.Screen name="Search">
					{({ navigation }) => (
						<SearchScreen onBackPress={() => navigation.goBack()} />
					)}
				</RootStack.Screen>
				<RootStack.Screen name="ArtistDetail">
					{({ route, navigation }) => (
						<ArtistsScreen
							artistId={route.params.id}
							artistName={route.params.name}
							artistImage={route.params.image}
							albums={route.params.albums}
							songs={route.params.songs}
							totalDuration={route.params.totalDuration}
							onPlaySong={onPlaySong}
							onBackPress={() => navigation.goBack()}
						/>
					)}
				</RootStack.Screen>
				<RootStack.Screen name="AlbumDetail">
					{({ route, navigation }) => (
						<AlbumsScreen
							albumId={route.params.id}
							albumTitle={route.params.title}
							albumImage={route.params.image}
							artist={route.params.artist}
							year={route.params.year}
							songs={route.params.songs}
							totalDuration={route.params.totalDuration}
							onPlaySong={onPlaySong}
							onBackPress={() => navigation.goBack()}
						/>
					)}
				</RootStack.Screen>
			</RootStack.Navigator>
		</NavigationContainer>
	);
};

const styles = StyleSheet.create({
	mainScreenLayout: {
		flex: 1,
	},
	mainScreenContent: {
		flex: 1,
	},
});

export default AppNavigation;
