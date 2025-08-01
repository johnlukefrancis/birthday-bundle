// Input Handler - Centralized input management
import { EventBus, EVENTS } from '../core/events.js';
import { gameState } from '../core/state.js';

export class InputHandler {
  constructor() {
    this.setupEventListeners();
  }
  
  init() {
    this.bindInputEvents();
    console.log('Input handler initialized');
  }
  
  bindInputEvents() {
    // Start game button
    const startBtn = document.getElementById('startButton');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        EventBus.emit(EVENTS.GAME_START);
        EventBus.emit(EVENTS.AUDIO_PLAY_SFX, 'door');
        EventBus.emit(EVENTS.AUDIO_PLAY_MUSIC);
      });
    }
    
    // Plant watering buttons (event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('water-button')) {
        const plantId = e.target.dataset.id;
        EventBus.emit(EVENTS.PLANT_WATERED, { plantId, amount: 8 });
      }
    });
    
    // Power-up button
    const powerUpBtn = document.getElementById('powerUp');
    if (powerUpBtn) {
      powerUpBtn.addEventListener('click', () => {
        this.activatePowerUp();
      });
    }
    
    // Audio controls
    const muteBtn = document.getElementById('muteButton');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        EventBus.emit(EVENTS.AUDIO_MUTE_TOGGLE);
      });
    }
    
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        EventBus.emit('audio:setVolume', volume);
        localStorage.setItem('volume', volume);
      });
    }
    
    // High contrast toggle
    const contrastBtn = document.getElementById('contrastToggle');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        this.toggleHighContrast();
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
  }
  
  handleKeyboard(e) {
    // Space bar for power-up
    if (e.code === 'Space' && gameState.timeRemaining <= 60 && gameState.running) {
      e.preventDefault();
      this.activatePowerUp();
    }
    
    // ESC to pause/reset
    if (e.code === 'Escape' && gameState.running) {
      EventBus.emit(EVENTS.GAME_STOP);
    }
  }
  
  activatePowerUp() {
    // Water all plants
    gameState.plants.forEach(plant => {
      EventBus.emit(EVENTS.PLANT_WATERED, { plantId: plant.id, amount: 12 });
    });
    
    // Hide power-up
    this.hidePowerUp();
    EventBus.emit(EVENTS.AUDIO_PLAY_SFX, 'success');
  }
  
  showPowerUp() {
    const powerUp = document.getElementById('powerUp');
    if (powerUp) {
      powerUp.classList.remove('hidden');
    }
  }
  
  hidePowerUp() {
    const powerUp = document.getElementById('powerUp');
    if (powerUp) {
      powerUp.classList.add('hidden');
    }
  }
  
  toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);
    return isHighContrast;
  }
  
  loadSettings() {
    // Load high contrast setting
    const highContrast = localStorage.getItem('highContrast') === 'true';
    if (highContrast) {
      document.body.classList.add('high-contrast');
    }
    
    // Load volume setting
    const volume = localStorage.getItem('volume');
    if (volume) {
      const volumeSlider = document.getElementById('volumeSlider');
      if (volumeSlider) {
        volumeSlider.value = volume;
        EventBus.emit('audio:setVolume', parseFloat(volume));
      }
    }
  }
  
  setupEventListeners() {
    EventBus.on('timer:powerup', () => this.showPowerUp());
    EventBus.on(EVENTS.GAME_RESET, () => this.hidePowerUp());
    
    // Handle audio mute button updates
    EventBus.on(EVENTS.AUDIO_MUTE_TOGGLE, (muted) => {
      const muteBtn = document.getElementById('muteButton');
      if (muteBtn) {
        muteBtn.textContent = muted ? '🔇' : '🔊';
      }
    });
  }
}
