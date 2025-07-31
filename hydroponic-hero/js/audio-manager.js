// Audio system management
import { gameState } from './game-state.js';

// Initialize audio state in gameState
if (!gameState.audio) {
  gameState.audio = {
    loops: [],
    current: null,
    sfx: {},
    muted: false,
    volume: 0.8
  };
}

// Load all audio assets
export function loadAudio() {
  const loopPaths = [
    'assets/audio/loop1.mp3',
    'assets/audio/loop2.mp3',
    'assets/audio/loop3.mp3'
  ];
  gameState.audio.loops = loopPaths.map(p => {
    const a = new Audio(p);
    a.loop = true;
    a.volume = gameState.audio.volume;
    return a;
  });
  const sfxNames = ['door', 'drop', 'alert', 'success', 'fail'];
  sfxNames.forEach(name => {
    const a = new Audio(`assets/audio/sfx/${name}.mp3`);
    a.volume = gameState.audio.volume;
    gameState.audio.sfx[name] = a;
  });
}

// Play random background loop
export function playLoop() {
  if (gameState.audio.current) {
    gameState.audio.current.pause();
  }
  const choice = Math.floor(Math.random() * gameState.audio.loops.length);
  gameState.audio.current = gameState.audio.loops[choice];
  if (!gameState.audio.muted) {
    gameState.audio.current.currentTime = 0;
    gameState.audio.current.volume = gameState.audio.volume;
    gameState.audio.current.play();
  }
}

// Play sound effect
export function playSfx(name) {
  const sound = gameState.audio.sfx[name];
  if (!sound) return;
  if (gameState.audio.muted) return;
  sound.currentTime = 0;
  sound.volume = gameState.audio.volume;
  sound.play();
}

// Mute/unmute audio
export function toggleMute() {
  gameState.audio.muted = !gameState.audio.muted;
  if (gameState.audio.current) {
    if (gameState.audio.muted) {
      gameState.audio.current.pause();
    } else {
      gameState.audio.current.play();
    }
  }
  return gameState.audio.muted;
}

// Set volume
export function setVolume(volume) {
  gameState.audio.volume = volume;
  gameState.audio.loops.forEach(loop => loop.volume = volume);
  Object.values(gameState.audio.sfx).forEach(sfx => sfx.volume = volume);
  if (gameState.audio.current) {
    gameState.audio.current.volume = volume;
  }
}
