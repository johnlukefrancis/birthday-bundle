// Audio System - Centralized audio management
import { gameState } from '../core/state.js';
import { EventBus, EVENTS } from '../core/events.js';

export class AudioSystem {
  constructor() {
    this.setupEventListeners();
  }
  
  async init() {
    this.loadAudio();
    console.log('Audio system initialized');
  }
  
  loadAudio() {
    const loopPaths = [
      'assets/audio/loop1.mp3',
      'assets/audio/loop2.mp3',
      'assets/audio/loop3.mp3'
    ];
    
    gameState.audio.loops = loopPaths.map(path => {
      const audio = new Audio(path);
      audio.loop = true;
      audio.volume = gameState.audio.volume;
      return audio;
    });
    
    const sfxNames = ['door', 'drop', 'alert', 'success', 'fail'];
    sfxNames.forEach(name => {
      const audio = new Audio(`assets/audio/sfx/${name}.mp3`);
      audio.volume = gameState.audio.volume;
      gameState.audio.sfx[name] = audio;
    });
  }
  
  playLoop() {
    if (gameState.audio.current) {
      gameState.audio.current.pause();
    }
    
    const choice = Math.floor(Math.random() * gameState.audio.loops.length);
    gameState.audio.current = gameState.audio.loops[choice];
    
    if (!gameState.audio.muted) {
      gameState.audio.current.currentTime = 0;
      gameState.audio.current.volume = gameState.audio.volume;
      gameState.audio.current.play().catch(e => console.warn('Audio play failed:', e));
    }
  }
  
  playSfx(name) {
    const sound = gameState.audio.sfx[name];
    if (!sound || gameState.audio.muted) return;
    
    sound.currentTime = 0;
    sound.volume = gameState.audio.volume;
    sound.play().catch(e => console.warn('SFX play failed:', e));
  }
  
  toggleMute() {
    gameState.audio.muted = !gameState.audio.muted;
    
    if (gameState.audio.current) {
      if (gameState.audio.muted) {
        gameState.audio.current.pause();
      } else {
        gameState.audio.current.play().catch(e => console.warn('Audio resume failed:', e));
      }
    }
    
    EventBus.emit(EVENTS.AUDIO_MUTE_TOGGLE, gameState.audio.muted);
    return gameState.audio.muted;
  }
  
  setVolume(volume) {
    gameState.audio.volume = Math.max(0, Math.min(1, volume));
    
    gameState.audio.loops.forEach(loop => loop.volume = gameState.audio.volume);
    Object.values(gameState.audio.sfx).forEach(sfx => sfx.volume = gameState.audio.volume);
    
    if (gameState.audio.current) {
      gameState.audio.current.volume = gameState.audio.volume;
    }
  }
  
  setupEventListeners() {
    EventBus.on(EVENTS.AUDIO_PLAY_SFX, (sfxName) => this.playSfx(sfxName));
    EventBus.on(EVENTS.AUDIO_PLAY_MUSIC, () => this.playLoop());
    EventBus.on('audio:setVolume', (volume) => this.setVolume(volume));
  }
  
  reset() {
    if (gameState.audio.current) {
      gameState.audio.current.pause();
      gameState.audio.current = null;
    }
  }
}
