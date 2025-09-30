// Fish-related moves integrated with boardgame.io
// Each move must return the updated G (game state)

const { Fish } = require('../models/Fish');
const { Tray } = require('../models/Tray');
const { AquaponicsSystem } = require('../models/AquaponicsSystem');

// Helper to ensure aquaponicsSystem aggregate exists in state
function ensureSystem(G) {
  if (!G.aquaponicsSystem) {
    G.aquaponicsSystem = new AquaponicsSystem();
  }
  return G.aquaponicsSystem;
}

const fishMoves = {
  addFish: (G, ctx, type, count = 1) => {
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
    G.gameTime += 1; // time advancement
    return { ...G };
  },

  addTray: (G, ctx, plantType) => {
    const system = ensureSystem(G);
    const trayId = `tray_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    system.trays[trayId] = new Tray(trayId, plantType);
    G.lastAction = { type: 'addTray', trayId, plantType };
    return { ...G };
  },

  progressTurn: (G, ctx) => {
    const system = ensureSystem(G);
    const entry = system.processTurn(G.fish);
    G.gameTime += 1;
    G.lastAction = { type: 'progressTurn', entry };
    return { ...G };
  }
};

module.exports = fishMoves;