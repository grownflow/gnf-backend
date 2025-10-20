const { AquaponicsSystem } = require('../models/AquaponicsSystem');

const systemMoves = {
  progressTurn: (G, ctx) => {
    if (!G.aquaponicsSystem) {
      G.aquaponicsSystem = new AquaponicsSystem();
    }
    
    const entry = G.aquaponicsSystem.processTurn();
    G.gameTime += 1 /* Day */;
    G.lastAction = { type: 'progressTurn', entry };
    return { ...G };
  }
};

module.exports = systemMoves;