// Audio System for Galaxy Garden Crush
class AudioSystemClass {
  constructor() {
    this.loops = {};
    this.sfx = {};
    this.currentLoop = null;
    this.initialized = false;
    
    // Audio assets to load
    this.audioAssets = [
      { key: 'A', src: 'assets/audio/loops/loopA.mp3' },
      { key: 'B', src: 'assets/audio/loops/loopB.mp3' },
      { key: 'C', src: 'assets/audio/loops/loopC.mp3' },
      { key: 'swap', src: 'assets/audio/sfx/swap.mp3' },
      { key: 'match', src: 'assets/audio/sfx/match.mp3' },
      { key: 'special', src: 'assets/audio/sfx/special.mp3' },
      { key: 'pass', src: 'assets/audio/sfx/pass.mp3' },
      { key: 'fail', src: 'assets/audio/sfx/fail.mp3' },
      { key: 'dundun', src: 'assets/audio/sfx/dundun.mp3' }
    ];
    
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    EventBus.on('assets:loadRequest', () => this.loadAudioAssets());
    EventBus.on(EVENTS.AUDIO_PLAY_MUSIC, (data) => this.playMusic(data.track));
    EventBus.on(EVENTS.AUDIO_STOP_MUSIC, () => this.stopMusic());
    EventBus.on(EVENTS.AUDIO_PLAY_SFX, (data) => this.playSfx(data.sound));
    EventBus.on(EVENTS.AUDIO_VOLUME_CHANGED, (data) => this.setVolume(data.volume));
    EventBus.on(EVENTS.AUDIO_MUTE_TOGGLED, (data) => this.setMuted(data.muted));
  }
  
  // Load all audio assets
  async loadAudioAssets() {
    console.log('Loading audio assets...');
    
    const promises = this.audioAssets.map(item => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = item.src;
        audio.loop = item.key === 'A' || item.key === 'B' || item.key === 'C';
        
        audio.addEventListener('canplaythrough', () => {
          this.updateLoadProgress();
          resolve();
        });
        
        audio.addEventListener('error', () => {
          console.warn('Failed to load audio:', item.src);
          this.updateLoadProgress();
          resolve();
        });
        
        // Store in appropriate collection
        if (item.key.length === 1) {
          this.loops[item.key] = audio;
        } else {
          this.sfx[item.key] = audio;
        }
      });
    });
    
    await Promise.all(promises);
    this.applyVolumeSettings();
    this.initialized = true;
    console.log('Audio assets loaded');
  }
  
  // Update loading progress
  updateLoadProgress() {
    // Simplified progress tracking - audio is part of overall loading
    // Real implementation would coordinate with other systems
    EventBus.emit('loading:progress', {
      system: 'audio',
      progress: 100 / this.audioAssets.length
    });
  }
  
  // Apply volume settings to all audio
  applyVolumeSettings() {
    const volume = GameState.get('volume');
    const muted = GameState.get('muted');
    
    Object.values(this.loops).forEach(audio => {
      audio.volume = muted ? 0 : volume;
    });
    
    Object.values(this.sfx).forEach(audio => {
      audio.volume = muted ? 0 : volume;
    });
  }
  
  // Play background music
  playMusic(track) {
    if (!this.initialized) {
      console.warn('Audio system not initialized');
      return;
    }
    
    // Stop current music
    this.stopMusic();
    
    // Start new track
    const audio = this.loops[track];
    if (audio) {
      this.currentLoop = audio;
      const volume = GameState.get('volume');
      const muted = GameState.get('muted');
      
      audio.volume = muted ? 0 : volume;
      audio.currentTime = 0;
      
      audio.play().catch(error => {
        console.warn('Failed to play music:', error);
      });
      
      console.log('Playing music track:', track);
    } else {
      console.warn('Music track not found:', track);
    }
  }
  
  // Stop background music
  stopMusic() {
    if (this.currentLoop) {
      this.currentLoop.pause();
      this.currentLoop.currentTime = 0;
      this.currentLoop = null;
    }
  }
  
  // Play sound effect
  playSfx(soundName) {
    if (!this.initialized) {
      console.warn('Audio system not initialized');
      return;
    }
    
    const audio = this.sfx[soundName];
    if (audio) {
      const volume = GameState.get('volume');
      const muted = GameState.get('muted');
      
      audio.volume = muted ? 0 : volume;
      audio.currentTime = 0;
      
      audio.play().catch(error => {
        console.warn('Failed to play sound effect:', error);
      });
    } else {
      console.warn('Sound effect not found:', soundName);
    }
  }
  
  // Set volume level
  setVolume(volume) {
    GameState.set('volume', volume);
    this.applyVolumeSettings();
    GameState.saveSettings();
    
    // Update UI slider
    EventBus.emit('ui:volumeChanged', { volume });
  }
  
  // Toggle mute state
  setMuted(muted) {
    GameState.set('muted', muted);
    this.applyVolumeSettings();
    GameState.saveSettings();
    
    // Update UI button
    EventBus.emit('ui:muteChanged', { muted });
  }
  
  // Get current playing music track
  getCurrentTrack() {
    if (!this.currentLoop) return null;
    
    for (const [key, audio] of Object.entries(this.loops)) {
      if (audio === this.currentLoop) {
        return key;
      }
    }
    return null;
  }
  
  // Check if audio is playing
  isPlaying() {
    return this.currentLoop && !this.currentLoop.paused;
  }
  
  // Pause/resume current music
  pauseMusic() {
    if (this.currentLoop && !this.currentLoop.paused) {
      this.currentLoop.pause();
    }
  }
  
  resumeMusic() {
    if (this.currentLoop && this.currentLoop.paused) {
      this.currentLoop.play().catch(error => {
        console.warn('Failed to resume music:', error);
      });
    }
  }
  
  // Cleanup
  destroy() {
    this.stopMusic();
    
    // Clear all audio objects
    Object.values(this.loops).forEach(audio => {
      audio.src = '';
    });
    
    Object.values(this.sfx).forEach(audio => {
      audio.src = '';
    });
    
    this.loops = {};
    this.sfx = {};
    this.currentLoop = null;
    this.initialized = false;
  }
}

// Create global audio system instance
const AudioSystem = new AudioSystemClass();

// Export for module usage
window.AudioSystem = AudioSystem;
