// Timer System for Galaxy Garden Crush

class TimerSystemClass {
  constructor() {
    this.timerId = null;
    this.paused = false;
    this.initialized = false;
    
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    EventBus.on('timer:start', (data) => this.startTimer(data.duration));
    EventBus.on('timer:stop', () => this.stopTimer());
    EventBus.on('timer:pause', () => this.pauseTimer());
    EventBus.on('timer:resume', () => this.resumeTimer());
    EventBus.on(EVENTS.LEVEL_START, (data) => this.handleLevelStart(data));
    EventBus.on(EVENTS.GAME_PAUSE, () => this.pauseTimer());
    EventBus.on(EVENTS.GAME_RESUME, () => this.resumeTimer());
  }
  
  // Initialize timer system
  initialize() {
    this.initialized = true;
    console.log('Timer system initialized');
  }
  
  // Handle level start
  handleLevelStart(data) {
    const { level } = data;
    
    // Guard against undefined level
    if (!level) {
      console.error('Timer system: level data is undefined');
      return;
    }
    
    // Stop any existing timer
    this.stopTimer();
    
    // Start timer for timed levels
    if (level.goal.type === 'timed' && level.time) {
      this.startTimer(level.time);
      console.log(`Started timer for ${level.time} seconds`);
    }
  }
  
  // Start countdown timer
  startTimer(duration) {
    this.stopTimer(); // Clear any existing timer
    
    // Set initial time
    GameState.set('timerRemaining', duration);
    
    // Start countdown
    this.timerId = setInterval(() => {
      if (!this.paused) {
        this.tick();
      }
    }, 1000);
    
    console.log(`Timer started: ${duration} seconds`);
  }
  
  // Timer tick - called every second
  tick() {
    const remaining = GameState.get('timerRemaining');
    
    if (remaining <= 0) {
      this.stopTimer();
      this.handleTimeExpired();
      return;
    }
    
    const newRemaining = remaining - 1;
    GameState.set('timerRemaining', newRemaining);
    
    // Emit tick event
    EventBus.emit(EVENTS.TIMER_TICK, { 
      remaining: newRemaining,
      total: this.getInitialTime()
    });
    
    // Warning at 10 seconds
    if (newRemaining === 10) {
      EventBus.emit(EVENTS.TIMER_WARNING, { remaining: newRemaining });
      console.log('Timer warning: 10 seconds remaining');
    }
    
    // Warning at 5 seconds
    if (newRemaining === 5) {
      EventBus.emit(EVENTS.TIMER_WARNING, { remaining: newRemaining });
      console.log('Timer warning: 5 seconds remaining');
    }
  }
  
  // Stop timer
  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      this.paused = false;
      console.log('Timer stopped');
    }
  }
  
  // Pause timer
  pauseTimer() {
    if (this.timerId) {
      this.paused = true;
      console.log('Timer paused');
    }
  }
  
  // Resume timer
  resumeTimer() {
    if (this.timerId) {
      this.paused = false;
      console.log('Timer resumed');
    }
  }
  
  // Handle time expiration
  handleTimeExpired() {
    console.log('Timer expired');
    
    // Check if goal was met
    const level = GameState.getCurrentLevel();
    const score = GameState.get('score');
    
    let success = false;
    if (level && level.goal.type === 'timed') {
      success = score >= level.goal.target;
    }
    
    // Emit timer expired event
    EventBus.emit(EVENTS.TIMER_EXPIRED, { success });
    
    // Trigger level completion
    EventBus.emit(EVENTS.LEVEL_COMPLETE, { 
      success,
      levelIndex: GameState.get('levelIndex'),
      score: score,
      reason: 'timeExpired'
    });
  }
  
  // Get initial time for current level
  getInitialTime() {
    const level = GameState.getCurrentLevel();
    return level && level.time ? level.time : 0;
  }
  
  // Get remaining time
  getRemainingTime() {
    return GameState.get('timerRemaining');
  }
  
  // Get elapsed time
  getElapsedTime() {
    const initial = this.getInitialTime();
    const remaining = this.getRemainingTime();
    return initial - remaining;
  }
  
  // Check if timer is running
  isRunning() {
    return this.timerId !== null && !this.paused;
  }
  
  // Check if timer is paused
  isPaused() {
    return this.paused;
  }
  
  // Add time (for special effects like stasis)
  addTime(seconds) {
    if (this.timerId) {
      const current = GameState.get('timerRemaining');
      const newTime = Math.max(0, current + seconds);
      GameState.set('timerRemaining', newTime);
      
      console.log(`Added ${seconds} seconds to timer (now ${newTime})`);
      
      // Emit time added event
      EventBus.emit('timer:timeAdded', { 
        seconds,
        newRemaining: newTime
      });
    }
  }
  
  // Temporarily pause timer (for stasis special)
  pauseTemporarily(duration) {
    if (!this.timerId) return;
    
    console.log(`Timer paused temporarily for ${duration} seconds`);
    
    this.pauseTimer();
    
    // Resume after duration
    setTimeout(() => {
      this.resumeTimer();
      console.log('Timer resumed after temporary pause');
    }, duration * 1000);
    
    // Visual feedback
    EventBus.emit('timer:temporaryPause', { duration });
  }
  
  // Format time for display
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // Get formatted remaining time
  getFormattedTime() {
    return this.formatTime(this.getRemainingTime());
  }
  
  // Set timer for testing purposes
  setTime(seconds) {
    GameState.set('timerRemaining', seconds);
  }
  
  // Fast forward timer (for testing)
  fastForward(seconds) {
    const current = GameState.get('timerRemaining');
    const newTime = Math.max(0, current - seconds);
    GameState.set('timerRemaining', newTime);
    
    if (newTime === 0) {
      this.handleTimeExpired();
    }
  }
}

// Create global timer system instance
const TimerSystem = new TimerSystemClass();

// Export for module usage
window.TimerSystem = TimerSystem;
