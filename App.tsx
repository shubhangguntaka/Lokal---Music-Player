import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
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
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  const currentTrack = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const positionMillis = usePlayerStore((state) => state.positionMillis);
  const durationMillis = usePlayerStore((state) => state.durationMillis);
  const playSong = usePlayerStore((state) => state.playSong);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);

  const handlePlaySong = (song: PlayerTrack, nextQueue: PlayerTrack[]) => {
    playSong(song, nextQueue);
    setIsNowPlayingOpen(true);
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
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.appContainer}>
        <View style={styles.screenContainer}>{currentScreen}</View>
        {currentTrack && (
          <View
            style={[
              styles.miniPlayerWrapper,
              currentMainScreen === 'home'
                ? styles.miniPlayerWithBottomNav
                : styles.miniPlayerNoBottomNav,
            ]}
          >
            <Player
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onOpen={() => setIsNowPlayingOpen(true)}
              onTogglePlay={handleTogglePlay}
              onNext={handleNext}
            />
          </View>
        )}
        {currentMainScreen === 'home' && (
          <BottomNavBar activeTab={activeBottomTab} onTabPress={setActiveBottomTab} />
        )}

    <Modal
      visible={isNowPlayingOpen && !!currentTrack}
      animationType="slide"
      onRequestClose={() => setIsNowPlayingOpen(false)}
    >
      {currentTrack && (
        <NowPlayingScreen
          track={currentTrack}
          isPlaying={isPlaying}
          positionMillis={positionMillis}
          durationMillis={durationMillis}
          onClose={() => setIsNowPlayingOpen(false)}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </Modal>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  miniPlayerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 10,
  },
  miniPlayerWithBottomNav: {
    bottom: 60,
  },
  miniPlayerNoBottomNav: {
    bottom: 16,
  },
});
