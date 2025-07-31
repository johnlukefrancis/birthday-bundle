// Plant Management - Core plant logic and state
import { gameState } from '../core/state.js';
import { EventBus, EVENTS } from '../core/events.js';

export class PlantManager {
  constructor() {
    this.plants = new Map();
    this.setupEventListeners();
  }
  
  async init() {
    const plantsData = await this.loadPlantData();
    gameState.plants = plantsData;
    
    // Initialize plant states
    plantsData.forEach(plant => {
      this.registerPlant(plant);
      gameState.hydros[plant.id] = 60; // Start at 60%
      gameState.failTimers[plant.id] = 0;
    });
    
    console.log('Plant manager initialized');
  }
  
  async loadPlantData() {
    // Load from inline script first (for file protocol compatibility)
    const inline = document.getElementById('plantData');
    if (inline) {
      try {
        const obj = JSON.parse(inline.textContent.trim());
        return obj.plants || obj;
      } catch (err) {
        console.warn('Failed to parse inline plant data', err);
      }
    }
    
    // Fallback to JSON file
    try {
      const res = await fetch('data/plants.json');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Failed to load plant data:', err);
      return [];
    }
  }
  
  registerPlant(plantData) {
    this.plants.set(plantData.id, {
      ...plantData,
      state: 'healthy',
      lastWatered: Date.now()
    });
  }
  
  waterPlant(plantId, amount = 20) {
    if (gameState.hydros[plantId] === undefined) return false;
    
    const oldHydration = gameState.hydros[plantId];
    gameState.hydros[plantId] = Math.min(100, oldHydration + amount);
    
    // Update plant state
    const plant = this.plants.get(plantId);
    if (plant) {
      plant.lastWatered = Date.now();
    }
    
    // Emit state change event (not PLANT_WATERED to avoid loop)
    EventBus.emit(EVENTS.PLANT_STATE_CHANGE, { plantId, hydration: gameState.hydros[plantId] });
    EventBus.emit(EVENTS.AUDIO_PLAY_SFX, 'drop');
    
    return true;
  }
  
  update(delta) {
    // Update hydration levels for all plants
    gameState.plants.forEach(plant => {
      const id = plant.id;
      
      // Drain hydration
      gameState.hydros[id] -= plant.drain * delta;
      if (gameState.hydros[id] < 0) gameState.hydros[id] = 0;
      
      // Check fail conditions
      const hydration = gameState.hydros[id];
      if (hydration < plant.optimal[0]) {
        gameState.failTimers[id] += delta;
      } else {
        gameState.failTimers[id] = 0;
      }
      
      // Plant failure after 6 seconds outside optimal range
      if (gameState.failTimers[id] > 6) {
        this.plantFailed(id);
        return;
      }
      
      // Update plant visual state
      this.updatePlantState(plant);
    });
  }
  
  updatePlantState(plant) {
    const hydration = gameState.hydros[plant.id];
    let newState;
    
    if (hydration > plant.optimal[1]) {
      newState = 'overwatered';
    } else if (hydration >= plant.optimal[0]) {
      newState = 'healthy';
    } else {
      newState = 'thirsty';
    }
    
    const plantObj = this.plants.get(plant.id);
    if (plantObj && plantObj.state !== newState) {
      plantObj.state = newState;
      EventBus.emit(EVENTS.PLANT_STATE_CHANGE, { plantId: plant.id, state: newState, hydration });
    }
  }
  
  plantFailed(plantId) {
    EventBus.emit(EVENTS.PLANT_FAILED, { plantId });
    EventBus.emit(EVENTS.GAME_STOP);
  }
  
  getPlantState(plantId) {
    return this.plants.get(plantId);
  }
  
  setupEventListeners() {
    // Listen for watering events from UI
    EventBus.on(EVENTS.PLANT_WATERED, ({ plantId, amount }) => {
      this.waterPlant(plantId, amount);
    });
  }
  
  reset() {
    gameState.plants.forEach(plant => {
      gameState.hydros[plant.id] = 60;
      gameState.failTimers[plant.id] = 0;
      
      const plantObj = this.plants.get(plant.id);
      if (plantObj) {
        plantObj.state = 'healthy';
      }
    });
  }
}
