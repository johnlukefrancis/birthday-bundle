import { gameState } from './game-state.js';

// Timer and countdown management
export function startCountdown(onTimeUp) {
  const timerEl = document.getElementById('timeRemaining');
  
  gameState.countInterval = setInterval(() => {
    gameState.timeRemaining--;
    timerEl.textContent = gameState.timeRemaining;
    
    if (gameState.timeRemaining <= 0) {
      clearInterval(gameState.countInterval);
      onTimeUp();
    }
    
    // Power-up at 30 seconds
    if (gameState.timeRemaining === 30) {
      showPowerUp();
    }
  }, 1000);
}

// Show power-up button
function showPowerUp() {
  const powerUp = document.getElementById('powerUp');
  powerUp.classList.remove('hidden');
}

// Hide power-up button
export function hidePowerUp() {
  const powerUp = document.getElementById('powerUp');
  powerUp.classList.add('hidden');
}

// Screen transitions
export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
}

// Overlay management
export function showOverlay(title, subtitle, showFacts = false) {
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySubtitle = document.getElementById('overlaySubtitle');
  const factsCarousel = document.getElementById('factsCarousel');
  
  overlayTitle.textContent = title;
  overlaySubtitle.textContent = subtitle;
  
  if (showFacts) {
    factsCarousel.classList.remove('hidden');
  } else {
    factsCarousel.classList.add('hidden');
  }
  
  overlay.classList.remove('hidden');
}

export function hideOverlay() {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
}

// High contrast mode
export function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');
  const isHighContrast = document.body.classList.contains('high-contrast');
  localStorage.setItem('highContrast', isHighContrast);
  return isHighContrast;
}

// Load saved settings
export function loadSettings() {
  const highContrast = localStorage.getItem('highContrast') === 'true';
  if (highContrast) {
    document.body.classList.add('high-contrast');
  }
  
  const volume = localStorage.getItem('volume');
  if (volume) {
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.value = volume;
  }
}
