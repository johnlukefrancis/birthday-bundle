// Overlay Manager - Handle game overlays and modals
import { gameState, setUIState } from '../core/state.js';
import { EventBus, EVENTS } from '../core/events.js';

export class OverlayManager {
  constructor() {
    this.overlay = null;
    this.currentFactIndex = 0;
    this.facts = [];
    this.setupEventListeners();
  }
  
  init() {
    this.overlay = document.getElementById('overlay');
    console.log('Overlay manager initialized');
  }
  
  showOverlay(title, subtitle, showFacts = false) {
    if (!this.overlay) return;
    
    const titleEl = document.getElementById('overlayTitle');
    const subtitleEl = document.getElementById('overlaySubtitle');
    const factsCarousel = document.getElementById('factsCarousel');
    
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    
    if (showFacts && factsCarousel) {
      this.setupFactsCarousel();
      factsCarousel.classList.remove('hidden');
    } else if (factsCarousel) {
      factsCarousel.classList.add('hidden');
    }
    
    this.overlay.classList.remove('hidden');
    setUIState({ overlayVisible: true });
    
    EventBus.emit(EVENTS.UI_OVERLAY_SHOW, { title, subtitle, showFacts });
  }
  
  hideOverlay() {
    if (!this.overlay) return;
    
    this.overlay.classList.add('hidden');
    setUIState({ overlayVisible: false });
    
    EventBus.emit(EVENTS.UI_OVERLAY_HIDE);
  }
  
  setupFactsCarousel() {
    // Collect all facts from plants
    this.facts = [];
    gameState.plants.forEach(plant => {
      if (plant.tips) this.facts.push(...plant.tips);
      if (plant.trivia) this.facts.push(...plant.trivia);
    });
    
    this.currentFactIndex = 0;
    this.showNextFact();
  }
  
  showNextFact() {
    if (this.facts.length === 0) return;
    
    const factsContent = document.getElementById('factsContent');
    if (factsContent) {
      factsContent.textContent = this.facts[this.currentFactIndex];
      this.currentFactIndex = (this.currentFactIndex + 1) % this.facts.length;
    }
  }
  
  showMissionComplete() {
    // Calculate success rate
    const totalPlants = gameState.plants.length;
    const healthyPlants = gameState.plants.filter(plant => {
      const hydration = gameState.hydros[plant.id];
      return hydration >= plant.optimal[0] && hydration <= plant.optimal[1];
    }).length;
    
    const successRate = Math.round((healthyPlants / totalPlants) * 100);
    
    this.showOverlay(
      'Mission Status: Complete',
      `Hydroponics efficiency: ${successRate}%`,
      true
    );
    
    EventBus.emit(EVENTS.AUDIO_PLAY_SFX, 'success');
  }
  
  showMissionFailed() {
    this.showOverlay(
      'Mission Status: Critical Failure',
      'Plant casualties detected. Recommendation: Additional training required.',
      false
    );
    
    EventBus.emit(EVENTS.AUDIO_PLAY_SFX, 'fail');
  }
  
  setupEventListeners() {
    EventBus.on('timer:complete', () => this.showMissionComplete());
    EventBus.on(EVENTS.PLANT_FAILED, () => this.showMissionFailed());
    
    // Next fact button
    const nextFactBtn = document.getElementById('nextFact');
    if (nextFactBtn) {
      nextFactBtn.addEventListener('click', () => this.showNextFact());
    }
    
    // Play again button
    const playAgainBtn = document.getElementById('playAgain');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        this.hideOverlay();
        EventBus.emit(EVENTS.GAME_RESET);
      });
    }
  }
}
