const { Fish } = require('../models/Fish');
const { AquaponicsSystem } = require('../models/AquaponicsSystem');

// Helper to ensure aquaponicsSystem aggregate exists in state
function ensureSystem(G) {
  if (!G.aquaponicsSystem) {
    G.aquaponicsSystem = new AquaponicsSystem();
  }
  return G.aquaponicsSystem;
}

// Fish-related moves integrated with boardgame.io
// Each move must return the updated G (game state)
const fishMoves = {
  addFish: (G, ctx, type, count = 1) => { // Fingerling
    const id = `${type}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    G.fish.push(new Fish(type, count));
    return { ...G };
  },

  feedFish: (G, ctx, fishIndex, foodAmount) => {
    const fish = G.fish[fishIndex];
    if (!fish) return G;
    const result = fish.feed(foodAmount);
    // Advance simulation turn when feeding occurs
    const system = ensureSystem(G);
    system.processTurn(G.fish);
    // Track last action
    G.lastAction = { type: 'feedFish', fishIndex, result };
    return { ...G };
  }

};

module.exports = fishMoves;