// Plant Renderer - Visual representation of plants
import { gameState } from '../core/state.js';
import { EventBus, EVENTS } from '../core/events.js';

export class PlantRenderer {
  constructor() {
    this.setupEventListeners();
  }
  
  init() {
    this.buildPlantCards();
    console.log('Plant renderer initialized');
  }
  
  buildPlantCards() {
    const container = document.getElementById('plantsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.plants.forEach((plant, index) => {
      const card = this.createPlantCard(plant, index);
      container.appendChild(card);
    });
  }
  
  createPlantCard(plant, index) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.dataset.id = plant.id;
    
    // Plant image
    const img = document.createElement('img');
    img.src = `assets/images/img${index + 1}.jpg`;
    img.alt = plant.name;
    img.className = 'plant-image';
    card.appendChild(img);
    
    // Plant name
    const name = document.createElement('div');
    name.className = 'plant-name';
    name.textContent = plant.name;
    card.appendChild(name);
    
    // Health bar
    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';
    
    const barFill = document.createElement('div');
    barFill.className = 'bar-fill';
    barFill.style.width = '60%';
    barContainer.appendChild(barFill);
    card.appendChild(barContainer);
    
    // Status light
    const status = document.createElement('div');
    status.className = 'status-light';
    card.appendChild(status);
    
    // Water button
    const button = document.createElement('button');
    button.className = 'water-button';
    button.textContent = 'Water';
    button.dataset.id = plant.id;
    card.appendChild(button);
    
    return card;
  }
  
  updatePlantVisuals() {
    gameState.plants.forEach(plant => {
      this.updatePlantCard(plant);
    });
  }
  
  updatePlantCard(plant) {
    const card = document.querySelector(`.plant-card[data-id="${plant.id}"]`);
    if (!card) return;
    
    const fill = card.querySelector('.bar-fill');
    const light = card.querySelector('.status-light');
    const hydration = gameState.hydros[plant.id];
    
    // Update health bar
    const pct = Math.max(0, Math.min(100, hydration));
    fill.style.width = `${pct}%`;
    
    // Determine color based on plant's optimal range
    let color;
    if (pct > plant.optimal[1]) {
      color = '#4da8a0'; // blue (overwatered)
    } else if (pct >= plant.optimal[0]) {
      color = '#2ca58d'; // green (optimal)
    } else if (pct >= plant.optimal[0] - 10) {
      color = '#f4a261'; // yellow (warning)
    } else {
      color = '#e76f51'; // red (critical)
    }
    
    fill.style.backgroundColor = color;
    light.style.backgroundColor = color;
    
    // Update card visual state
    card.classList.remove('healthy', 'thirsty', 'overwatered');
    if (pct > plant.optimal[1]) {
      card.classList.add('overwatered');
    } else if (pct < plant.optimal[0]) {
      card.classList.add('thirsty');
    } else {
      card.classList.add('healthy');
    }
  }
  
  setupEventListeners() {
    EventBus.on(EVENTS.PLANT_STATE_CHANGE, () => this.updatePlantVisuals());
  }
  
  reset() {
    this.updatePlantVisuals();
  }
}
