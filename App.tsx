import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SearchScreen from './src/screens/SearchScreen';
import ArtistsScreen from './src/screens/ArtistsScreen';
import AlbumsScreen from './src/screens/AlbumsScreen';
import NowPlayingScreen from './src/screens/NowPlayingScreen';
import Player, { PlayerTrack } from './src/components/Player';
import { usePlayerStore } from './src/store/playerStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavBar, { BottomTab } from './src/components/BottomNavBar';
import FavouritesScreen from './src/screens/FavouritesScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';

type MainScreen = 'home' | 'search' | 'artistDetail' | 'albumDetail';

interface ArtistDetail {
	id: string;
	name: string;
	image: any;
	albums: number;
	songs: number;
	totalDuration?: string;
}

interface AlbumDetail {
	id: string;
	title: string;
	image: any;
	artist: string;
	year: number;
	songs: number;
	totalDuration?: string;
}

export default function App() {
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('Home');
  const [currentMainScreen, setCurrentMainScreen] = useState<MainScreen>('home');
  const [selectedArtist, setSelectedArtist] = useState<ArtistDetail | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDetail | null>(null);
  const [sheetIndex, setSheetIndex] = useState(-1);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const currentTrack = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const positionMillis = usePlayerStore((state) => state.positionMillis);
  const durationMillis = usePlayerStore((state) => state.durationMillis);
  const playSong = usePlayerStore((state) => state.playSong);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const isExpanded = sheetIndex === 1;

  const snapPoints = useMemo(() => [110, '100%'], []);

  const openNowPlaying = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const collapseNowPlaying = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  useEffect(() => {
    if (currentTrack) {
      bottomSheetRef.current?.snapToIndex(0);
      setSheetIndex(0);
      return;
    }

    bottomSheetRef.current?.close();
    setSheetIndex(-1);
  }, [currentTrack]);

  const handlePlaySong = (song: PlayerTrack, nextQueue: PlayerTrack[]) => {
    playSong(song, nextQueue);
  };

  const handleTogglePlay = () => {
    togglePlay();
  };

  const handleNext = () => {
    playNext();
  };

  const handlePrevious = () => {
    playPrevious();
  };

  const handleSeek = (nextPositionMillis: number) => {
    seekTo(nextPositionMillis);
  };

  const currentScreen = useMemo(() => {
    if (currentMainScreen === 'search') {
      return <SearchScreen onBackPress={() => setCurrentMainScreen('home')} />;
    }

    if (currentMainScreen === 'artistDetail' && selectedArtist) {
      return (
        <ArtistsScreen
          artistId={selectedArtist.id}
          artistName={selectedArtist.name}
          artistImage={selectedArtist.image}
          albums={selectedArtist.albums}
          songs={selectedArtist.songs}
          totalDuration={selectedArtist.totalDuration}
          onPlaySong={handlePlaySong}
          onBackPress={() => setCurrentMainScreen('home')}
        />
      );
    }

    if (currentMainScreen === 'albumDetail' && selectedAlbum) {
      return (
        <AlbumsScreen
          albumId={selectedAlbum.id}
          albumTitle={selectedAlbum.title}
          albumImage={selectedAlbum.image}
          artist={selectedAlbum.artist}
          year={selectedAlbum.year}
          songs={selectedAlbum.songs}
          totalDuration={selectedAlbum.totalDuration}
          onPlaySong={handlePlaySong}
          onBackPress={() => setCurrentMainScreen('home')}
        />
      );
    }

    switch (activeBottomTab) {
      case 'Home':
        return (
          <HomeScreen
            onSearchPress={() => setCurrentMainScreen('search')}
            onPlaySong={handlePlaySong}
            onArtistPress={(artist) => {
              setSelectedArtist(artist);
              setCurrentMainScreen('artistDetail');
            }}
            onAlbumPress={(album) => {
              setSelectedAlbum(album);
              setCurrentMainScreen('albumDetail');
            }}
          />
        );
      case 'Favorites':
        return <FavouritesScreen />;
      case 'Playlists':
        return <PlaylistsScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return (
          <HomeScreen
            onSearchPress={() => setCurrentMainScreen('search')}
            onPlaySong={handlePlaySong}
            onArtistPress={(artist) => {
              setSelectedArtist(artist);
              setCurrentMainScreen('artistDetail');
            }}
            onAlbumPress={(album) => {
              setSelectedAlbum(album);
              setCurrentMainScreen('albumDetail');
            }}
          />
        );
    }
  }, [
    activeBottomTab,
    currentMainScreen,
    selectedArtist,
    selectedAlbum,
    handlePlaySong,
  ]);

  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.appContainer}>
          <View style={styles.screenContainer}>{currentScreen}</View>

          {currentMainScreen === 'home' && (
            <BottomNavBar activeTab={activeBottomTab} onTabPress={setActiveBottomTab} />
          )}

          {currentTrack && (
            <BottomSheet
              ref={bottomSheetRef}
              index={0}
              snapPoints={snapPoints}
              onChange={setSheetIndex}
              handleIndicatorStyle={styles.sheetHandleIndicator}
              backgroundStyle={[
                styles.sheetBackground,
                isExpanded && styles.sheetBackgroundExpanded,
              ]}
              containerStyle={[
                styles.sheetContainer,
                isExpanded ? styles.sheetContainerExpanded : styles.sheetContainerCollapsed,
              ]}
              enablePanDownToClose={false}
              enableOverDrag={false}
              bottomInset={isExpanded ? 0 : currentMainScreen === 'home' ? 86 : 14}
            >
              <BottomSheetView style={styles.sheetContent}>
                {sheetIndex <= 0 ? (
                  <Player
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onOpen={openNowPlaying}
                    onTogglePlay={handleTogglePlay}
                    onNext={handleNext}
                  />
                ) : (
                  <NowPlayingScreen
                    track={currentTrack}
                    isPlaying={isPlaying}
                    positionMillis={positionMillis}
                    durationMillis={durationMillis}
                    onClose={collapseNowPlaying}
                    onTogglePlay={handleTogglePlay}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onSeek={handleSeek}
                  />
                )}
              </BottomSheetView>
            </BottomSheet>
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  sheetContainer: {
    marginBottom: 0,
  },
  sheetContainerCollapsed: {
    paddingHorizontal: 10,
    marginBottom: -10,
  },
  sheetContainerExpanded: {
    paddingHorizontal: 0,
  },
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sheetBackgroundExpanded: {
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sheetHandleIndicator: {
    width: 44,
    height: 4,
    backgroundColor: '#D7D7D7',
  },
  sheetContent: {
    flex: 1,
  },
});
