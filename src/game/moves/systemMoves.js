const { AquaponicsSystem } = require('../models/AquaponicsSystem');
const { EventManager } = require('../utils/EventManager');

const systemMoves = {
  progressTurn: (G, ctx) => {
    if (!G.aquaponicsSystem) {
      G.aquaponicsSystem = new AquaponicsSystem();
    }
    
    // Apply active event effects before processing turn
    EventManager.applyEventEffects(G);
    
    const entry = G.aquaponicsSystem.processTurn();
    G.gameTime += 1 /* Day */;
    
    // Check for random events
    const triggeredEvent = EventManager.checkForRandomEvent(G);
    
    // Progress active event duration
    EventManager.progressEvent(G);
    
    G.lastAction = { 
      type: 'progressTurn', 
      entry,
      eventTriggered: triggeredEvent !== null,
      event: triggeredEvent ? {
        name: triggeredEvent.name,
        description: triggeredEvent.description,
        turnsRemaining: triggeredEvent.turnsRemaining
      } : null
    };
    
    return { ...G };
  }
};

module.exports = systemMoves;