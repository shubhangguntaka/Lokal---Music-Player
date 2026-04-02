# Lokal Music Player

React Native assignment submission for the React Native Intern role at Lokal.

This project is a mobile-first music player built with Expo + TypeScript. It focuses on a smooth playback experience (mini player + full now-playing sheet), queue management, offline downloads, and theme support, while keeping architecture simple and easy to reason about.

## About The App

Lokal Music Player is a client-side music app that fetches songs, albums, and artists from a public API and allows users to:

- Discover songs from Home and Search.
- Play songs with queue-aware controls.
- Open a full Now Playing experience from a mini player.
- Add songs to favourites and playlists.
- Download songs for offline playback.
- Switch app appearance between System, Light, and Dark modes.

### Key Features

- Playback controls: play, pause, next, previous, seek, playback speed, shuffle, repeat.
- Queue controls: add to queue, add next, reorder, remove, play specific index.
- Library actions: favourites, playlist creation, playlist track management.
- Offline mode: save track audio files locally and prefer local URI when available.
- Theming: centralized color tokens with persisted theme mode.
- Settings screen with persisted preferences.

## Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Expo CLI (optional; npx is enough)
- For device testing: Expo Go on Android/iOS
- For emulator/simulator:
  - Android Studio (Android)
  - Xcode (iOS, macOS only)

### Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

### Run Locally

```bash
npm run start
```

Then choose one target:

- Android:

```bash
npm run android
```

- iOS:

```bash
npm run ios
```

- Web:

```bash
npm run web
```

### Optional: EAS Build

`eas.json` already defines development, preview, and production build profiles.

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

## Architecture

The app follows a feature-layered structure:

```text
src/
  components/   -> reusable UI building blocks (Player, headers, sheets, nav)
  navigator/    -> app-level routing and screen composition
  screens/      -> feature screens and user interaction flows
  services/     -> side effects (API, audio engine wrapper, offline file storage)
  store/        -> global state (player, library, theme)
  theme/        -> color tokens and theme resolution hooks
```

### High-Level Flow

1. Screen interactions dispatch actions to Zustand stores.
2. `playerStore` orchestrates queue state and playback actions.
3. `audioPlayer` service wraps `expo-av` and emits playback status updates.
4. Playback status is pushed back into `playerStore` for reactive UI updates.
5. UI components consume store state via selectors.

### Navigation Design

- Root stack uses React Navigation native stack.
- Main app content lives in a custom Tabs shell (`Home`, `Favorites`, `Playlists`, `Settings`).
- Detail routes (`Search`, `ArtistDetail`, `AlbumDetail`) are stack screens.
- Player UI is app-global in `App.tsx` via a bottom sheet that toggles:
  - Collapsed mini player
  - Expanded now playing screen

### State Management

- `playerStore` (persisted): playback state, queue, repeat/shuffle mode, playback rate, downloaded track map.
- `themeStore` (persisted): user theme mode (`system | light | dark`).
- `libraryStore` (in-memory): favourites and playlists.
- `SettingsScreen` also persists settings under `lokal_music_settings`.

### Services

- `api.ts`: song/artist/album search with normalization and playable URL extraction.
- `audioPlayer.ts`: single `Audio.Sound` instance lifecycle and playback control.
- `offlineStorage.ts`: local download/delete/exists operations using `expo-file-system/legacy`.

### Background Audio Considerations

- `audioPlayer.ts` enables background-friendly audio mode (`staysActiveInBackground: true`).
- `app.json` includes:
  - iOS `UIBackgroundModes: ["audio"]`
  - Android `WAKE_LOCK` permission

## Trade-offs

### 1) Fast Iteration with Expo + Client-Only Architecture

- Why: Quick development and easy testing for assignment scope.
- Trade-off: No custom backend, so behavior depends on public API quality and availability.

### 2) Zustand for Global State

- Why: Lightweight API, easy selector usage, minimal boilerplate.
- Trade-off: Requires discipline around boundaries; store actions can grow large if not split over time.

### 3) Single Sound Instance in Audio Service

- Why: Simple mental model and robust control for one active track.
- Trade-off: No support for advanced multi-track scenarios (crossfade, gapless, parallel previews).

### 4) Partial Persistence Strategy

- Why: Persisting player/theme gives a good UX after relaunch with low complexity.
- Trade-off: `libraryStore` is currently in-memory, so favourites/playlists reset after app restart.

### 5) Offline Downloads via FileSystem

- Why: Practical offline support without extra infrastructure.
- Trade-off: No cache eviction policy, storage quota handling, or encryption/DRM management yet.

### 6) Settings Scope vs Functional Wiring

- Why: Settings UI/persistence is ready for future expansion.
- Trade-off: Some toggles (`highQualityStreaming`, `dataSaver`, `showExplicitContent`, `autoplayNext`) are stored but not yet fully wired into API filtering/playback policy.

### 7) Custom Bottom Navigation + Global Bottom Sheet Player

- Why: Enables tailored UX and persistent player access across screens.
- Trade-off: More custom UI/state coordination compared to fully out-of-the-box navigation tabs/player patterns.

## Assignment Notes

This README is intentionally written to cover the requested assignment dimensions:

- Setup: how to install, run, and build.
- Architecture: structure, navigation, state, services, and playback flow.
- Trade-offs: design decisions and known limitations with rationale.

If needed, I can also add:

- API contract notes and failure handling strategy.
- Test plan and manual QA checklist.
- Future roadmap with prioritized milestones.