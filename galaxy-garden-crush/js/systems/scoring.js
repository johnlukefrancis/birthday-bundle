// Scoring System for Galaxy Garden Crush
class ScoringSystemClass {
  constructor() {
    this.initialized = false;
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    EventBus.on(EVENTS.SCORE_CHANGED, (data) => this.updateScore(data));
    EventBus.on(EVENTS.MATCH_DETECTED, (data) => this.processMatchScore(data));
    EventBus.on(EVENTS.SPECIAL_ACTIVATED, (data) => this.processSpecialScore(data));
    EventBus.on('grid:tilesCleared', (data) => this.processClearScore(data));
  }
  
  // Initialize scoring system
  initialize() {
    this.initialized = true;
    console.log('Scoring system initialized');
  }
  
  // Process score from matches
  processMatchScore(data) {
    const { matches, combo = 1 } = data;
    
    if (!matches || matches.length === 0) return;
    
    // Base score calculation
    const basePoints = matches.length * 10;
    const comboMultiplier = combo;
    const totalPoints = basePoints * comboMultiplier;
    
    // Add to current score
    const currentScore = GameState.get('score');
    const newScore = currentScore + totalPoints;
    
    GameState.set('score', newScore);
    
    console.log(`Match score: ${matches.length} tiles × 10 × ${combo} combo = ${totalPoints} points`);
    
    // Check for score-based goal completion
    this.checkScoreGoal(newScore);
  }
  
  // Process score from special activations
  processSpecialScore(data) {
    const { specials } = data;
    
    if (!specials || specials.length === 0) return;
    
    // Bonus points for special activations
    const bonusPoints = specials.length * 25;
    const currentScore = GameState.get('score');
    const newScore = currentScore + bonusPoints;
    
    GameState.set('score', newScore);
    
    console.log(`Special bonus: ${specials.length} specials × 25 = ${bonusPoints} points`);
  }
  
  // Process score from tile clearing (for cascades)
  processCleanScore(data) {
    const { cleared, combo = 1 } = data;
    
    if (!cleared || cleared.length === 0) return;
    
    // Calculate points for cleared tiles
    const points = this.calculateClearPoints(cleared, combo);
    
    // Add to score
    const currentScore = GameState.get('score');
    const newScore = currentScore + points;
    
    GameState.set('score', newScore);
    
    // Process special goal tracking
    this.processGoalTracking(cleared);
    
    console.log(`Clear score: ${points} points (combo ${combo})`);
  }
  
  // Calculate points for cleared tiles
  calculateClearPoints(cleared, combo) {
    const basePoints = cleared.length * 10;
    return basePoints * combo;
  }
  
  // Process goal tracking for special objectives
  processGoalTracking(cleared) {
    const level = GameState.getCurrentLevel();
    if (!level) return;
    
    const board = GameState.get('board');
    
    // Track collect goals (e.g., collect rose buds)
    if (level.goal.type === 'collect') {
      let collected = 0;
      
      for (const [r, c] of cleared) {
        // Check if cleared tile matches target type
        const targetType = level.goal.tileType || 0; // Default to rose (type 0)
        
        // Note: We need the tile type before it was cleared
        // This should be handled by the grid system
        // For now, assume all cleared tiles of correct type count
        collected++;
      }
      
      const currentCount = GameState.get('collectCount');
      GameState.set('collectCount', currentCount + collected);
      
      console.log(`Collected ${collected} items (total: ${currentCount + collected})`);
    }
    
    // Track iced tile clearing
    if (level.goal.type === 'iced') {
      // Count remaining iced tiles
      let icedRemaining = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c] && board[r][c].iced > 0) {
            icedRemaining++;
          }
        }
      }
      
      GameState.set('icedRemaining', icedRemaining);
      console.log(`Iced tiles remaining: ${icedRemaining}`);
    }
    
    // Track special creation
    if (level.goal.type === 'special') {
      // This is handled separately when specials are created
      // Update the display
      const specialCounts = GameState.get('specialCounts');
      console.log('Special counts:', specialCounts);
    }
  }
  
  // Update score display and handle events
  updateScore(data) {
    const { points, combo } = data;
    
    if (points) {
      const currentScore = GameState.get('score');
      const newScore = currentScore + points;
      GameState.set('score', newScore);
      
      // Trigger score change events for UI
      EventBus.emit('ui:scoreUpdated', { 
        oldScore: currentScore,
        newScore,
        points,
        combo
      });
    }
  }
  
  // Check if score-based goal is met
  checkScoreGoal(score) {
    const level = GameState.getCurrentLevel();
    if (!level || level.goal.type !== 'score') return;
    
    if (score >= level.goal.target) {
      console.log(`Score goal reached: ${score}/${level.goal.target}`);
      EventBus.emit('goal:scoreReached', { 
        score,
        target: level.goal.target
      });
    }
  }
  
  // Process special tile creation
  processSpecialCreation(data) {
    const { specials } = data;
    
    if (!specials || specials.length === 0) return;
    
    const specialCounts = { ...GameState.get('specialCounts') };
    
    for (const special of specials) {
      const type = special.type;
      specialCounts[type] = (specialCounts[type] || 0) + 1;
    }
    
    GameState.set('specialCounts', specialCounts);
    
    console.log('Special created:', specials);
    
    // Check special-based goal
    this.checkSpecialGoal(specialCounts);
  }
  
  // Check if special-based goal is met
  checkSpecialGoal(specialCounts) {
    const level = GameState.getCurrentLevel();
    if (!level || level.goal.type !== 'special') return;
    
    const target = level.goal.target;
    let goalMet = true;
    
    // Check if we have enough of each special type
    for (let type = 0; type < 5; type++) {
      if ((specialCounts[type] || 0) < target) {
        goalMet = false;
        break;
      }
    }
    
    if (goalMet) {
      console.log(`Special goal reached: ${target} of each type`);
      EventBus.emit('goal:specialReached', { 
        counts: specialCounts,
        target
      });
    }
  }
  
  // Get current score
  getCurrentScore() {
    return GameState.get('score');
  }
  
  // Get score for level completion bonus
  getLevelBonus() {
    const level = GameState.getCurrentLevel();
    const movesLeft = GameState.get('movesLeft');
    
    // Bonus points for remaining moves
    if (level && level.goal.type !== 'timed' && movesLeft > 0) {
      return movesLeft * 100;
    }
    
    return 0;
  }
  
  // Apply level completion bonus
  applyLevelBonus() {
    const bonus = this.getLevelBonus();
    if (bonus > 0) {
      const currentScore = GameState.get('score');
      GameState.set('score', currentScore + bonus);
      
      console.log(`Level completion bonus: ${bonus} points`);
      
      return bonus;
    }
    
    return 0;
  }
  
  // Reset score for new level
  resetScore() {
    GameState.set('score', 0);
  }
  
  // Get high score (could be implemented with localStorage)
  getHighScore() {
    return parseInt(localStorage.getItem('ggc_highScore') || '0');
  }
  
  // Update high score if current score is higher
  updateHighScore() {
    const currentScore = this.getCurrentScore();
    const highScore = this.getHighScore();
    
    if (currentScore > highScore) {
      localStorage.setItem('ggc_highScore', currentScore.toString());
      console.log(`New high score: ${currentScore}`);
      return true;
    }
    
    return false;
  }
}

// Create global scoring system instance
const ScoringSystem = new ScoringSystemClass();

// Additional event listeners for special creation
EventBus.on('specials:created', (data) => ScoringSystem.processSpecialCreation(data));

// Export for module usage
window.ScoringSystem = ScoringSystem;
