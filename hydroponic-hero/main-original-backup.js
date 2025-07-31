// Hydroponic Hero - Main Entry Point
// Modular architecture for clean code organization

import { gameState, initializePlantState, waterPlant } from './js/game-state.js';
import { loadAudio, playLoop, playSfx, toggleMute, setVolume } from './js/audio-manager.js';
import { loadPlants, buildPlantCards, gameLoop } from './js/plant-system.js';
import { startCountdown, hidePowerUp, showScreen, showOverlay, hideOverlay, toggleHighContrast, loadSettings } from './js/ui-controller.js';
import { pick, EventEmitter } from './js/utils.js';

// Game event system
const gameEvents = new EventEmitter();

// Game initialization
async function initGame() {
  try {
    // Load settings and audio
    loadSettings();
    loadAudio();
    
    // Load plant data
    gameState.plants = await loadPlants();
    initializePlantState(gameState.plants);
    
    // Build UI
    buildPlantCards(gameState.plants);
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Hydroponic Hero initialized successfully');
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

// Event listener setup
function setupEventListeners() {
  // Start game button
  document.getElementById('startButton').addEventListener('click', startGame);
  
  // Plant watering buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('water-button')) {
      const plantId = e.target.dataset.id;
      waterPlant(plantId);
      playSfx('drop');
    }
  });
  
  // Power-up button
  document.getElementById('powerUp').addEventListener('click', () => {
    gameState.plants.forEach(plant => waterPlant(plant.id, 30));
    playSfx('success');
    hidePowerUp();
  });
  
  // Space bar for power-up
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState.timeRemaining <= 60 && gameState.running) {
      e.preventDefault();
      document.getElementById('powerUp').click();
    }
  });
  
  // Audio controls
  document.getElementById('muteButton').addEventListener('click', () => {
    const muted = toggleMute();
    document.getElementById('muteButton').textContent = muted ? '🔇' : '🔊';
  });
  
  document.getElementById('volumeSlider').addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
    localStorage.setItem('volume', volume);
  });
  
  // High contrast toggle
  document.getElementById('contrastToggle').addEventListener('click', toggleHighContrast);
  
  // Play again button
  document.getElementById('playAgain').addEventListener('click', resetGame);
  
  // Facts navigation
  document.getElementById('nextFact').addEventListener('click', showNextFact);
}

// Start the game
function startGame() {
  gameState.running = true;
  gameState.timeRemaining = 90;
  gameState.lastFrame = null;
  
  // Show game screen
  showScreen('game');
  
  // Start audio and timer
  playLoop();
  playSfx('door');
  startCountdown(missionComplete);
  
  // Start game loop
  requestAnimationFrame((timestamp) => gameLoop(timestamp, gameState.plants, missionFail));
}

// Mission complete (time up)
function missionComplete() {
  gameState.running = false;
  playSfx('success');
  
  // Calculate success rate
  const totalPlants = gameState.plants.length;
  const healthyPlants = gameState.plants.filter(plant => {
    const hydration = gameState.hydros[plant.id];
    return hydration >= plant.optimal[0] && hydration <= plant.optimal[1];
  }).length;
  
  const successRate = Math.round((healthyPlants / totalPlants) * 100);
  
  showOverlay(
    'Mission Status: Complete',
    `Hydroponics efficiency: ${successRate}%`,
    true
  );
  
  setupFactsCarousel();
}

// Mission failed
function missionFail() {
  gameState.running = false;
  playSfx('fail');
  
  showOverlay(
    'Mission Status: Critical Failure',
    'Plant casualties detected. Recommendation: Additional training required.',
    false
  );
}

// Reset game state
function resetGame() {
  gameState.running = false;
  gameState.timeRemaining = 90;
  gameState.lastFrame = null;
  
  if (gameState.countInterval) {
    clearInterval(gameState.countInterval);
  }
  
  // Reset plant hydration
  initializePlantState(gameState.plants);
  
  // Reset UI
  document.getElementById('timeRemaining').textContent = '90';
  hidePowerUp();
  hideOverlay();
  showScreen('intro');
}

// Facts carousel system
let currentFactIndex = 0;
let allFacts = [];

function setupFactsCarousel() {
  // Collect all facts from plants
  allFacts = [];
  gameState.plants.forEach(plant => {
    allFacts.push(...plant.tips, ...plant.trivia);
  });
  
  currentFactIndex = 0;
  showNextFact();
}

function showNextFact() {
  if (allFacts.length === 0) return;
  
  const factsContent = document.getElementById('factsContent');
  factsContent.textContent = allFacts[currentFactIndex];
  
  currentFactIndex = (currentFactIndex + 1) % allFacts.length;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Export for debugging (optional)
window.gameDebug = {
  gameState,
  gameEvents,
  waterPlant,
  playSfx
};
