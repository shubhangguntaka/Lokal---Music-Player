import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NowPlayingScreen from './src/screens/NowPlayingScreen';
import Player, { PlayerTrack } from './src/components/Player';
import { usePlayerStore } from './src/store/playerStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './src/navigator/navigation';

export default function App() {
  const [isTabsRoute, setIsTabsRoute] = useState(true);
  const [sheetIndex, setSheetIndex] = useState(-1);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const currentTrack = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const positionMillis = usePlayerStore((state) => state.positionMillis);
  const durationMillis = usePlayerStore((state) => state.durationMillis);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const playSong = usePlayerStore((state) => state.playSong);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const setPlaybackRate = usePlayerStore((state) => state.setPlaybackRate);
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

  const handleChangePlaybackRate = (nextRate: number) => {
    setPlaybackRate(nextRate);
  };

  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.appContainer}>
          <View style={styles.screenContainer}>
            <AppNavigation
              onPlaySong={handlePlaySong}
              onTabsRouteChange={setIsTabsRoute}
            />
          </View>

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
              bottomInset={isExpanded ? 0 : isTabsRoute ? 86 : 14}
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
                    playbackRate={playbackRate}
                    onChangePlaybackRate={handleChangePlaybackRate}
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
