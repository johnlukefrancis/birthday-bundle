// Event Bus - Decoupled communication system
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
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  // Remove all listeners for an event
  clear(event) {
    this.listeners.delete(event);
  }
  
  // Remove all listeners
  clearAll() {
    this.listeners.clear();
  }
}

export const EventBus = new EventBusClass();

// Common game events (for reference)
export const EVENTS = {
  // Game lifecycle
  GAME_INIT: 'game:initializing',
  GAME_READY: 'game:initialized',
  GAME_START: 'game:started',
  GAME_STOP: 'game:stopped',
  GAME_RESET: 'game:reset',
  
  // Room events
  ROOM_ENTER: 'room:enter',
  ROOM_EXIT: 'room:exit',
  ROOM_STATE_CHANGE: 'room:stateChange',
  
  // Plant events
  PLANT_WATERED: 'plant:watered',
  PLANT_STATE_CHANGE: 'plant:stateChange',
  PLANT_FAILED: 'plant:failed',
  
  // UI events
  UI_SCREEN_CHANGE: 'ui:screenChange',
  UI_OVERLAY_SHOW: 'ui:overlayShow',
  UI_OVERLAY_HIDE: 'ui:overlayHide',
  
  // Audio events
  AUDIO_PLAY_SFX: 'audio:playSfx',
  AUDIO_PLAY_MUSIC: 'audio:playMusic',
  AUDIO_MUTE_TOGGLE: 'audio:muteToggle'
};
