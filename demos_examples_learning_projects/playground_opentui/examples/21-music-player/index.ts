/**
 * Example 21: Music Player - Cozy Lo-Fi Edition
 *
 * A warm, cozy terminal music player with lo-fi coffee shop vibes:
 * - Single-column layout focused on atmosphere
 * - Genre-based ASCII art (coffee, plant, rain, headphones, book)
 * - Integrated 16-bar visualizer with warm gradient colors
 * - Compact playlist with track navigation
 * - Full keyboard controls for playback
 */

import {
  TextRenderable,
  BoxRenderable,
  t,
  bold,
  fg,
  dim,
  type KeyEvent,
} from "@opentui/core";
import { themes, listThemes, type Theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { KeyBindingBar } from "@shared/widgets/KeyBindingBar";
import { Modal } from "@shared/widgets/Modal";
import { ProgressBar } from "@shared/widgets/ProgressBar";
import { getArtForGenre } from "./ascii-art";
import { Visualizer } from "./visualizer";

// Track interface
interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  duration: number; // seconds
}

// Sample playlist
const playlist: Track[] = [
  { id: 1, title: "Rainy Day Blues", artist: "Chillhop Raccoon", genre: "Chillhop", duration: 238 },
  { id: 2, title: "Midnight Coffee", artist: "Lo-Fi Girl", genre: "Lo-Fi", duration: 195 },
  { id: 3, title: "Autumn Leaves", artist: "Nature Sounds", genre: "Ambient", duration: 312 },
  { id: 4, title: "Sunday Morning", artist: "Smooth Jazz FM", genre: "Jazz", duration: 267 },
  { id: 5, title: "Study Session", artist: "Focus Beats", genre: "Focus", duration: 420 },
  { id: 6, title: "Night Drive", artist: "Synthwave Kid", genre: "Electronic", duration: 185 },
];

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// State (module level for key handler access)
let theme: Theme = themes.dracula;
let themeIndex = 0;
const themeNames = listThemes();

let currentTrackIndex = 0;
let selectedTrackIndex = 0;
let isPlaying = false;
let currentTime = 0;
let volume = 80;
let isMuted = false;
let shuffleEnabled = false;
let repeatMode: "off" | "all" | "one" = "off";

// UI elements (will be initialized in setup)
let artLines: TextRenderable[] = [];
let trackTitle: TextRenderable;
let trackArtist: TextRenderable;
let progressBar: ProgressBar;
let timeDisplay: TextRenderable;
let playbackStatus: TextRenderable;
let playlistItems: TextRenderable[] = [];
let artFrame: BoxRenderable;
let playlistSection: BoxRenderable;
let visualizer: Visualizer;
let keyBar: KeyBindingBar;
let helpModal: Modal;

// Update functions
function updateArt(): void {
  const art = getArtForGenre(playlist[currentTrackIndex].genre);
  for (let i = 0; i < artLines.length; i++) {
    artLines[i].content = art[i] || "";
  }
}

function updateTrackInfo(): void {
  const track = playlist[currentTrackIndex];
  trackTitle.content = t`${bold(fg(theme.colors.fg)(track.title))}`;
  trackArtist.content = track.artist;
}

function updateProgress(): void {
  const track = playlist[currentTrackIndex];
  const percent = (currentTime / track.duration) * 100;
  progressBar.setProgress(percent);
  timeDisplay.content = `${formatTime(currentTime)} ─────── ${formatTime(track.duration)}`;
}

function updatePlaybackStatus(): void {
  const parts: string[] = [];

  if (isPlaying) {
    parts.push("▶ Playing");
  } else {
    parts.push("⏸ Paused");
  }

  if (shuffleEnabled) {
    parts.push("🔀");
  }

  if (repeatMode === "all") {
    parts.push("🔁");
  } else if (repeatMode === "one") {
    parts.push("🔂");
  }

  const volumeIcon = isMuted ? "🔇" : volume > 50 ? "🔊" : volume > 0 ? "🔉" : "🔈";
  parts.push(`${volumeIcon} ${isMuted ? "muted" : volume + "%"}`);

  playbackStatus.content = parts.join("  ");
}

function updatePlaylist(): void {
  for (let i = 0; i < playlist.length; i++) {
    const track = playlist[i];
    const isCurrentTrack = i === currentTrackIndex;
    const isSelected = i === selectedTrackIndex;

    let prefix = "  ";
    if (isCurrentTrack && isPlaying) {
      prefix = "▶ ";
    } else if (isCurrentTrack) {
      prefix = "⏸ ";
    }

    const displayText = `${prefix}${track.title}`;

    if (isSelected) {
      playlistItems[i].content = t`${bold(fg(theme.colors.accent1)(displayText))}`;
    } else if (isCurrentTrack) {
      playlistItems[i].content = t`${fg(theme.colors.fgAccent)(displayText)}`;
    } else {
      playlistItems[i].content = t`${dim(displayText)}`;
      playlistItems[i].fg = theme.colors.fgMuted;
    }
  }
}

function updateTheme(): void {
  artFrame.borderColor = theme.colors.border;
  playlistSection.borderColor = theme.colors.border;
  progressBar.setTheme(theme);
  progressBar.setColor("#f59e0b"); // Keep warm amber
  visualizer.setTheme(theme);
  keyBar.setTheme(theme);
  helpModal.setTheme(theme);

  // Update art colors
  for (const line of artLines) {
    line.fg = theme.colors.fgMuted;
  }

  updateTrackInfo();
  updatePlaybackStatus();
  updatePlaylist();
}

function playTrack(index: number): void {
  if (index < 0 || index >= playlist.length) return;
  currentTrackIndex = index;
  selectedTrackIndex = index;
  currentTime = 0;
  isPlaying = true;
  updateArt();
  updateTrackInfo();
  updateProgress();
  updatePlaybackStatus();
  updatePlaylist();
}

function nextTrack(): void {
  if (shuffleEnabled) {
    let newIndex = Math.floor(Math.random() * playlist.length);
    while (newIndex === currentTrackIndex && playlist.length > 1) {
      newIndex = Math.floor(Math.random() * playlist.length);
    }
    playTrack(newIndex);
  } else {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    if (nextIndex === 0 && repeatMode === "off") {
      isPlaying = false;
      updatePlaybackStatus();
      updatePlaylist();
    } else {
      playTrack(nextIndex);
    }
  }
}

function prevTrack(): void {
  // If more than 3 seconds in, restart current track
  if (currentTime > 3) {
    currentTime = 0;
    updateProgress();
  } else {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIndex);
  }
}

function togglePlayPause(): void {
  isPlaying = !isPlaying;
  updatePlaybackStatus();
  updatePlaylist();
}

function seek(delta: number): void {
  const track = playlist[currentTrackIndex];
  currentTime = Math.max(0, Math.min(track.duration, currentTime + delta));
  updateProgress();
}

function cycleTheme(): void {
  themeIndex = (themeIndex + 1) % themeNames.length;
  theme = themes[themeNames[themeIndex]];
  updateTheme();
}

function cycleRepeat(): void {
  if (repeatMode === "off") {
    repeatMode = "all";
  } else if (repeatMode === "all") {
    repeatMode = "one";
  } else {
    repeatMode = "off";
  }
  updatePlaybackStatus();
}

function toggleShuffle(): void {
  shuffleEnabled = !shuffleEnabled;
  updatePlaybackStatus();
}

function adjustVolume(delta: number): void {
  volume = Math.max(0, Math.min(100, volume + delta));
  if (delta > 0) isMuted = false;
  updatePlaybackStatus();
}

function toggleMute(): void {
  isMuted = !isMuted;
  updatePlaybackStatus();
}

function handleKeyPress(key: KeyEvent): boolean {
  // Help modal takes priority
  if (helpModal.isVisible()) {
    if (key.name === "escape" || key.name === "?" || key.name === "q") {
      helpModal.hide();
      return true;
    }
    return true; // Consume all keys when modal is open
  }

  switch (key.name) {
    case "space":
      togglePlayPause();
      return true;

    case "up":
      prevTrack();
      return true;

    case "down":
      nextTrack();
      return true;

    case "left":
      seek(-10);
      return true;

    case "right":
      seek(10);
      return true;

    case "j":
      selectedTrackIndex = Math.min(selectedTrackIndex + 1, playlist.length - 1);
      updatePlaylist();
      return true;

    case "k":
      selectedTrackIndex = Math.max(selectedTrackIndex - 1, 0);
      updatePlaylist();
      return true;

    case "return":
    case "enter":
      playTrack(selectedTrackIndex);
      return true;

    case "s":
      toggleShuffle();
      return true;

    case "r":
      cycleRepeat();
      return true;

    case ",":
    case "<":
      adjustVolume(-5);
      return true;

    case ".":
    case ">":
      adjustVolume(5);
      return true;

    case "m":
      toggleMute();
      return true;

    case "t":
      cycleTheme();
      return true;

    case "?":
      helpModal.show();
      return true;

    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      const trackNum = parseInt(key.name) - 1;
      if (trackNum >= 0 && trackNum < playlist.length) {
        playTrack(trackNum);
      }
      return true;

    case "q":
      return false; // Let default q-to-exit handle it

    default:
      return false;
  }
}

createExampleApp(
  ({ renderer, addInterval, addCleanup }) => {
    // Main container
    const main = new BoxRenderable(renderer, {
      id: "main",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      padding: 1,
      alignItems: "center",
    });

    // Header: cozy title
    const header = new TextRenderable(renderer, {
      id: "header",
      content: t`${bold(fg("#f59e0b")("☕ WARM BEATS ☕"))}`,
    });

    const headerSpacer = new BoxRenderable(renderer, {
      id: "header-spacer",
      height: 1,
    });

    // Art frame container with border
    artFrame = new BoxRenderable(renderer, {
      id: "art-frame",
      flexDirection: "column",
      alignItems: "center",
      border: true,
      borderStyle: "rounded",
      borderColor: theme.colors.border,
      padding: 1,
      paddingLeft: 2,
      paddingRight: 2,
    });

    // ASCII art lines (12 lines)
    artLines = [];
    const currentArt = getArtForGenre(playlist[currentTrackIndex].genre);
    for (let i = 0; i < 12; i++) {
      const line = new TextRenderable(renderer, {
        id: `art-line-${i}`,
        content: currentArt[i] || "",
        fg: theme.colors.fgMuted,
      });
      artLines.push(line);
      artFrame.add(line);
    }

    // Visualizer (integrated in art frame)
    visualizer = new Visualizer(renderer, { theme });
    artFrame.add(visualizer.getContainer());

    // Track info section
    const trackInfoSection = new BoxRenderable(renderer, {
      id: "track-info",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 1,
      gap: 0,
    });

    trackTitle = new TextRenderable(renderer, {
      id: "track-title",
      content: t`${bold(fg(theme.colors.fg)(playlist[currentTrackIndex].title))}`,
    });

    trackArtist = new TextRenderable(renderer, {
      id: "track-artist",
      content: playlist[currentTrackIndex].artist,
      fg: theme.colors.fgMuted,
    });

    trackInfoSection.add(trackTitle);
    trackInfoSection.add(trackArtist);

    // Progress section
    const progressSection = new BoxRenderable(renderer, {
      id: "progress-section",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 1,
      width: "100%",
      maxWidth: 40,
    });

    progressBar = new ProgressBar(renderer, {
      theme,
      width: 30,
      showPercentage: false,
    });
    progressBar.setColor("#f59e0b"); // Warm amber

    timeDisplay = new TextRenderable(renderer, {
      id: "time-display",
      content: `${formatTime(currentTime)} ─────── ${formatTime(playlist[currentTrackIndex].duration)}`,
      fg: theme.colors.fgMuted,
    });

    progressSection.add(progressBar.getContainer());
    progressSection.add(timeDisplay);

    // Playback status
    playbackStatus = new TextRenderable(renderer, {
      id: "playback-status",
      content: "",
      fg: theme.colors.fgMuted,
    });

    // Playlist section
    playlistSection = new BoxRenderable(renderer, {
      id: "playlist-section",
      flexDirection: "column",
      paddingTop: 1,
      border: true,
      borderStyle: "rounded",
      borderColor: theme.colors.border,
      padding: 1,
      width: "100%",
      maxWidth: 40,
    });

    // Playlist items (show 6 tracks)
    playlistItems = [];
    for (let i = 0; i < playlist.length; i++) {
      const item = new TextRenderable(renderer, {
        id: `playlist-item-${i}`,
        content: "",
        fg: theme.colors.fg,
      });
      playlistItems.push(item);
      playlistSection.add(item);
    }

    // Key bindings bar
    keyBar = new KeyBindingBar(
      renderer,
      [
        { key: "Space", action: "play/pause" },
        { key: "↑↓", action: "skip" },
        { key: "t", action: "theme" },
        { key: "?", action: "help" },
        { key: "q", action: "quit" },
      ],
      { theme, id: "key-bar" }
    );

    // Help modal
    helpModal = new Modal(renderer, {
      theme,
      title: "Keyboard Shortcuts",
      width: 40,
      height: 18,
    });

    const helpContent = new BoxRenderable(renderer, {
      id: "help-content",
      flexDirection: "column",
      gap: 0,
    });

    const helpBindings = [
      ["Space", "Play / Pause"],
      ["↑ / ↓", "Previous / Next track"],
      ["← / →", "Seek backward / forward (10s)"],
      ["j / k", "Navigate playlist selection"],
      ["Enter", "Play selected track"],
      ["s", "Toggle shuffle"],
      ["r", "Cycle repeat (off → all → one)"],
      ["< / >", "Volume down / up"],
      ["m", "Toggle mute"],
      ["t", "Cycle theme"],
      ["1-6", "Jump to track"],
      ["?", "Toggle this help"],
      ["q", "Quit"],
    ];

    for (const [key, desc] of helpBindings) {
      const row = new TextRenderable(renderer, {
        id: `help-${key}`,
        content: `  ${key.padEnd(8)} ${desc}`,
        fg: theme.colors.fg,
      });
      helpContent.add(row);
    }

    helpModal.getContentArea().add(helpContent);

    // Build tree
    main.add(header);
    main.add(headerSpacer);
    main.add(artFrame);
    main.add(trackInfoSection);
    main.add(progressSection);
    main.add(playbackStatus);
    main.add(playlistSection);
    main.add(new BoxRenderable(renderer, { id: "spacer-bottom", flexGrow: 1 }));
    main.add(keyBar.getContainer());

    renderer.root.add(main);
    renderer.root.add(helpModal.getOverlay());

    // Initial render
    updatePlaylist();
    updateProgress();
    updatePlaybackStatus();

    // Playback loop (1 second intervals)
    const playbackLoop = setInterval(() => {
      if (isPlaying) {
        const track = playlist[currentTrackIndex];
        currentTime += 1;

        if (currentTime >= track.duration) {
          if (repeatMode === "one") {
            currentTime = 0;
          } else {
            nextTrack();
          }
        }

        updateProgress();
      }
    }, 1000);
    addInterval(playbackLoop);

    // Visualizer animation loop (50ms)
    const vizLoop = setInterval(() => {
      visualizer.update(isPlaying);
    }, 50);
    addInterval(vizLoop);

    // Cleanup
    addCleanup(() => {
      progressBar.destroy();
    });
  },
  {
    onKeyPress: (key) => handleKeyPress(key),
  }
);
