// Room System - Room navigation and management (ready for expansion)
import { gameState, setRoomState } from '../core/state.js';
import { EventBus, EVENTS } from '../core/events.js';

export class RoomSystem {
  constructor() {
    this.rooms = new Map();
    this.setupEventListeners();
  }
  
  init() {
    // Initialize with current single-room setup
    // Agent can expand this to multi-room system
    this.registerRoom('main', {
      name: 'Hydroponics Deck 7',
      plants: ['rose', 'fern', 'bonsai', 'succulent'],
      difficulty: 1.0
    });
    
    gameState.currentRoom = 'main';
    console.log('Room system initialized');
  }
  
  registerRoom(id, config) {
    this.rooms.set(id, {
      id,
      ...config,
      plants: config.plants || [],
      state: 'inactive'
    });
  }
  
  enterRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.warn(`Room ${roomId} not found`);
      return false;
    }
    
    // Exit current room
    if (gameState.currentRoom) {
      this.exitRoom(gameState.currentRoom);
    }
    
    // Enter new room
    gameState.currentRoom = roomId;
    room.state = 'active';
    
    EventBus.emit(EVENTS.ROOM_ENTER, { roomId, room });
    return true;
  }
  
  exitRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    room.state = 'inactive';
    EventBus.emit(EVENTS.ROOM_EXIT, { roomId, room });
  }
  
  getCurrentRoom() {
    return this.rooms.get(gameState.currentRoom);
  }
  
  getRoomHealth(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return 0;
    
    // Calculate aggregate health of plants in room
    let totalHealth = 0;
    let plantCount = 0;
    
    room.plants.forEach(plantId => {
      if (gameState.hydros[plantId] !== undefined) {
        const plant = gameState.plants.find(p => p.id === plantId);
        if (plant) {
          const hydration = gameState.hydros[plantId];
          const inOptimal = hydration >= plant.optimal[0] && hydration <= plant.optimal[1];
          totalHealth += inOptimal ? 100 : Math.max(0, hydration);
          plantCount++;
        }
      }
    });
    
    return plantCount > 0 ? totalHealth / plantCount : 0;
  }
  
  setupEventListeners() {
    // Future room navigation events
  }
  
  reset() {
    gameState.currentRoom = 'main';
    this.rooms.forEach(room => {
      room.state = 'inactive';
    });
  }
}
