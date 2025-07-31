// Global game state management
export const gameState = {
  plants: [],
  hydros: {},
  failTimers: {},
  running: false,
  timeRemaining: 90,
  countInterval: null,
  lastFrame: null,
  audio: {
    loops: [],
    current: null,
    sfx: {},
    muted: false,
    volume: 0.8
  },
  konamiIndex: 0,
  secretMode: false
};

// Initialize plant hydration levels
export function initializePlantState(plants) {
  plants.forEach(plant => {
    gameState.hydros[plant.id] = 60; // start in the middle
    gameState.failTimers[plant.id] = 0;
  });
}

// Update hydration levels and detect failures
export function updateHydration(plants, delta) {
  let failedPlant = null;
  plants.forEach(plant => {
    const id = plant.id;
    // drain per second
    gameState.hydros[id] -= plant.drain * delta;
    if (gameState.hydros[id] < 0) gameState.hydros[id] = 0;
    // check zone
    const hydration = gameState.hydros[id];
    if (hydration < plant.optimal[0]) {
      gameState.failTimers[id] += delta;
    } else {
      gameState.failTimers[id] = 0;
    }
    if (gameState.failTimers[id] > 6 && !failedPlant) {
      failedPlant = id;
    }
  });
  return failedPlant;
}

// Water a specific plant
export function waterPlant(plantId, amount = 20) {
  if (gameState.hydros[plantId] !== undefined) {
    gameState.hydros[plantId] = Math.min(100, gameState.hydros[plantId] + amount);
  }
}
