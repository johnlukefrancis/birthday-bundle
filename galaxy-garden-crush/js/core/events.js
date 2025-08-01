// Event Bus - Decoupled communication system for Galaxy Garden Crush
class EventBusClass {
  constructor() {
    this.listeners = new Map();
  }
  
  // Subscribe to an event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  // Unsubscribe from an event
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }
  
  // Emit an event
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  // Clear all listeners (useful for cleanup)
  clear() {
    this.listeners.clear();
  }
  
  // Get listener count for debugging
  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).length : 0;
  }
}

// Create global event bus instance
const EventBus = new EventBusClass();

// Event constants
const EVENTS = {
  // Game lifecycle
  GAME_INIT: 'game:init',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  LEVEL_START: 'level:start',
  LEVEL_COMPLETE: 'level:complete',
  
  // Gameplay events
  PIECE_SELECTED: 'piece:selected',
  PIECES_SWAPPED: 'pieces:swapped',
  SWAP_REJECTED: 'swap:rejected',
  MATCH_DETECTED: 'match:detected',
  CHAIN_COMPLETED: 'chain:completed',
  SPECIAL_ACTIVATED: 'special:activated',
  GRID_UPDATED: 'grid:updated',
  BOARD_SETTLED: 'board:settled',
  
  // Scoring events
  SCORE_CHANGED: 'score:changed',
  MOVES_CHANGED: 'moves:changed',
  
  // Timer events
  TIMER_TICK: 'timer:tick',
  TIMER_WARNING: 'timer:warning',
  TIMER_EXPIRED: 'timer:expired',
  
  // Audio events
  AUDIO_PLAY_SFX: 'audio:playSfx',
  AUDIO_PLAY_MUSIC: 'audio:playMusic',
  AUDIO_STOP_MUSIC: 'audio:stopMusic',
  AUDIO_VOLUME_CHANGED: 'audio:volumeChanged',
  AUDIO_MUTE_TOGGLED: 'audio:muteToggled',
  
  // UI events
  UI_SCREEN_CHANGE: 'ui:screenChange',
  UI_MODAL_SHOW: 'ui:modalShow',
  UI_MODAL_HIDE: 'ui:modalHide',
  UI_HUD_UPDATE: 'ui:hudUpdate',
  
  // Effects events
  EFFECT_SPAWN: 'effect:spawn',
  EFFECT_COMPLETE: 'effect:complete',
  
  // Input events
  INPUT_TILE_CLICK: 'input:tileClick',
  INPUT_TILE_DRAG: 'input:tileDrag',
  INPUT_GESTURE: 'input:gesture'
};

// Export for module usage
window.EventBus = EventBus;
window.EVENTS = EVENTS;
