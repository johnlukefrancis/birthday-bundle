// Core Game State - Central state management
export const gameState = {
  // Core game state
  running: false,
  timeRemaining: 90,
  countInterval: null,
  lastFrame: null,
  
  // Plant management
  plants: [],
  hydros: {},
  failTimers: {},
  
  // Room system (ready for expansion)
  currentRoom: null,
  rooms: {},
  roomStates: {},
  
  // Audio system
  audio: {
    loops: [],
    current: null,
    sfx: {},
    muted: false,
    volume: 0.8
  },
  
  // UI state
  ui: {
    currentScreen: 'intro',
    powerUpVisible: false,
    overlayVisible: false,
    highContrast: false
  },
  
  // Game progression
  score: 0,
  achievements: [],
  konamiIndex: 0,
  secretMode: false
};

// State mutation helpers
export function setState(updates) {
  Object.assign(gameState, updates);
}

export function setUIState(updates) {
  Object.assign(gameState.ui, updates);
}

export function setRoomState(roomId, updates) {
  if (!gameState.roomStates[roomId]) {
    gameState.roomStates[roomId] = {};
  }
  Object.assign(gameState.roomStates[roomId], updates);
}
