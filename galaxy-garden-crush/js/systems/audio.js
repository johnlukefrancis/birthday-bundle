// Audio System for Galaxy Garden Crush
class AudioSystemClass {
  constructor() {
    this.loops = {};
    this.sfx = {};
    this.currentLoop = null;
    this.initialized = false;
    this.userInteracted = false; // Track if user has interacted
    this.pendingMusicTrack = null; // Store music to play when user interacts
    
    // Audio assets to load
    this.audioAssets = [
      // Background music tracks (your 5 songs)
      { key: 'song1', src: 'assets/music/song1.mp3', type: 'music' },
      { key: 'song2', src: 'assets/music/song2.mp3', type: 'music' },
      { key: 'song3', src: 'assets/music/song3.mp3', type: 'music' },
      { key: 'song4', src: 'assets/music/song4.mp3', type: 'music' },
      { key: 'song5', src: 'assets/music/song5.mp3', type: 'music' },
      
      // Sound effects
      { key: 'swap', src: 'assets/audio/sfx/swap.mp3', type: 'sfx' },
      { key: 'match', src: 'assets/audio/sfx/match.mp3', type: 'sfx' },
      { key: 'special', src: 'assets/audio/sfx/special.mp3', type: 'sfx' },
      { key: 'pass', src: 'assets/audio/sfx/pass.mp3', type: 'sfx' },
      { key: 'fail', src: 'assets/audio/sfx/fail.mp3', type: 'sfx' },
      { key: 'dundun', src: 'assets/audio/sfx/dundun.mp3', type: 'sfx' }
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
    
    // Enable audio on first user interaction
    this.enableAudioOnInteraction();
  }
  
  // Enable audio playback after user interaction
  enableAudioOnInteraction() {
    this.audioPrompt = document.getElementById('audio-prompt');
    
    const enableAudio = () => {
      if (!this.userInteracted) {
        console.log('User interaction detected - enabling audio');
        this.userInteracted = true;
        
        // Hide the audio prompt
        if (this.audioPrompt) {
          this.audioPrompt.classList.add('hidden');
        }
        
        // Play pending music if any
        if (this.pendingMusicTrack) {
          console.log('Playing pending music:', this.pendingMusicTrack);
          this.playMusic(this.pendingMusicTrack);
          this.pendingMusicTrack = null;
        }
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
      }
    };
    
    // Listen for any user interaction
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    document.addEventListener('touchstart', enableAudio);
  }
  
  // Load all audio assets
  async loadAudioAssets() {
    console.log('Loading audio assets...', this.audioAssets.length, 'files');
    
    let loadedCount = 0;
    
    const promises = this.audioAssets.map((item, index) => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = item.src;
        audio.loop = item.type === 'music'; // Loop music, not sound effects
        audio.preload = 'auto'; // Ensure files are fully loaded
        
        const onLoad = () => {
          loadedCount++;
          console.log(`Loaded audio ${loadedCount}/${this.audioAssets.length}: ${item.key}`);
          this.updateLoadProgress(loadedCount, this.audioAssets.length);
          resolve();
        };
        
        const onError = (error) => {
          console.warn('Failed to load audio:', item.src, error);
          loadedCount++;
          this.updateLoadProgress(loadedCount, this.audioAssets.length);
          resolve(); // Still resolve to not block other assets
        };
        
        audio.addEventListener('canplaythrough', onLoad);
        audio.addEventListener('error', onError);
        
        // Timeout fallback for assets that take too long
        setTimeout(() => {
          if (loadedCount < index + 1) {
            console.warn('Audio loading timeout for:', item.src);
            onError('timeout');
          }
        }, 30000); // 30 second timeout
        
        // Store in appropriate collection based on type
        if (item.type === 'music') {
          this.loops[item.key] = audio;
        } else {
          this.sfx[item.key] = audio;
        }
        
        // Start loading
        audio.load();
      });
    });
    
    await Promise.all(promises);
    this.applyVolumeSettings();
    this.initialized = true;
    console.log('Audio assets loaded:', { 
      music: Object.keys(this.loops), 
      sfx: Object.keys(this.sfx) 
    });
  }
  
  // Update loading progress
  updateLoadProgress(loaded, total) {
    const progress = (loaded / total) * 100;
    EventBus.emit('loading:progress', {
      system: 'audio',
      progress: progress,
      loaded: loaded,
      total: total
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
    
    // If user hasn't interacted yet, store the track to play later
    if (!this.userInteracted) {
      console.log('User has not interacted yet, storing music track:', track);
      this.pendingMusicTrack = track;
      
      // Show the audio prompt
      if (this.audioPrompt) {
        this.audioPrompt.classList.remove('hidden');
      }
      
      return;
    }
    
    // Prevent rapid replay of same track
    const audio = this.loops[track];
    if (this.currentLoop === audio && !this.currentLoop.paused) {
      return;
    }
    
    // Stop current music
    this.stopMusic();
    
    // Start new track
    if (audio) {
      this.currentLoop = audio;
      const volume = GameState.get('volume');
      const muted = GameState.get('muted');
      
      audio.volume = muted ? 0 : volume;
      audio.currentTime = 0;
      
      console.log('Playing music track:', track);
      
      audio.play().then(() => {
        console.log('Music started successfully:', track);
      }).catch(error => {
        console.warn('Failed to play music:', error.message);
        // Store for later if autoplay failed
        if (!this.userInteracted) {
          this.pendingMusicTrack = track;
        }
      });
    } else {
      console.warn('Music track not found:', track);
    }
  }
  
  // Stop background music
  stopMusic() {
    console.log('stopMusic() called, currentLoop:', this.currentLoop ? 'exists' : 'null');
    if (this.currentLoop) {
      console.log('Stopping current music loop');
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

    console.log('Playing sound effect:', soundName);
    const audio = this.sfx[soundName];
    if (audio) {
      const volume = GameState.get('volume');
      const muted = GameState.get('muted');
      
      audio.volume = muted ? 0 : volume;
      audio.currentTime = 0;
      
      console.log('Audio file details:', {
        src: audio.src,
        duration: audio.duration,
        loop: audio.loop,
        volume: audio.volume
      });
      
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
