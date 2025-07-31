import { gameState, updateHydration } from './game-state.js';

// Plant data loading
export async function loadPlants() {
  // When running from the file protocol, fetching a local JSON will fail due to CORS.
  // If an inline script with id="plantData" exists, parse it and return its contents.
  const inline = document.getElementById('plantData');
  if (inline) {
    try {
      const obj = JSON.parse(inline.textContent.trim());
      return obj.plants || obj;
    } catch (err) {
      console.warn('Failed to parse inline plant data', err);
    }
  }
  // Fallback: fetch JSON (works when served over HTTP)
  const res = await fetch('data/plants.json');
  const data = await res.json();
  return data;
}

// Build plant cards in DOM
export function buildPlantCards(plants) {
  const container = document.getElementById('plantsContainer');
  container.innerHTML = '';
  plants.forEach((plant, index) => {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.dataset.id = plant.id;

    const img = document.createElement('img');
    img.src = `assets/images/img${index + 1}.jpg`;
    img.alt = plant.name;
    card.appendChild(img);

    const name = document.createElement('div');
    name.className = 'plant-name';
    name.textContent = plant.name;
    card.appendChild(name);

    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';
    const barFill = document.createElement('div');
    barFill.className = 'bar-fill';
    barFill.style.width = '60%';
    barContainer.appendChild(barFill);
    card.appendChild(barContainer);

    const status = document.createElement('div');
    status.className = 'status-light';
    card.appendChild(status);

    const button = document.createElement('button');
    button.className = 'water-button';
    button.textContent = 'Water';
    button.dataset.id = plant.id;
    card.appendChild(button);

    container.appendChild(card);
  });
}

// Update UI for each plant
export function updateUI(plants) {
  plants.forEach((plant, index) => {
    const id = plant.id;
    const card = document.querySelector(`.plant-card[data-id="${id}"]`);
    if (!card) return;
    
    const fill = card.querySelector('.bar-fill');
    const light = card.querySelector('.status-light');
    const hydration = gameState.hydros[id];
    // clamp values
    const pct = Math.max(0, Math.min(100, hydration));
    fill.style.width = `${pct}%`;
    // Determine colour
    let color;
    if (pct > plant.optimal[1]) {
      color = '#4da8a0'; // blue when above
    } else if (pct >= plant.optimal[0]) {
      color = '#2ca58d'; // green zone
    } else if (pct >= plant.optimal[0] - 10) {
      color = '#f4a261'; // yellow warning
    } else {
      color = '#e76f51'; // red critical
    }
    fill.style.backgroundColor = color;
    light.style.backgroundColor = color;
  });
}

// Main game loop using requestAnimationFrame
export function gameLoop(timestamp, plants, onFail) {
  if (!gameState.running) return;
  if (!gameState.lastFrame) gameState.lastFrame = timestamp;
  const deltaSec = (timestamp - gameState.lastFrame) / 1000;
  gameState.lastFrame = timestamp;
  const failed = updateHydration(plants, deltaSec);
  updateUI(plants);
  if (failed) {
    onFail();
    return;
  }
  requestAnimationFrame((ts) => gameLoop(ts, plants, onFail));
}
