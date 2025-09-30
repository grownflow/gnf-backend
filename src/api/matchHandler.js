const { AquaponicsGame } = require('../game/game');

// In-memory match storage (simplified)
const matches = new Map();

class MatchHandler {
  static create() {
    const matchID = Math.random().toString(36).substring(2, 15);
    const G = AquaponicsGame.setup();
    const ctx = {
      currentPlayer: '0',
      turn: 1,
      numPlayers: 1,
      playOrder: ['0'],
      playOrderPos: 0
    };
    
    matches.set(matchID, { G, ctx });
    return { matchID };
  }

  static getMatch(matchID) {
    return matches.get(matchID);
  }

  static makeMove(matchID, moveName, args, playerID) {
    const match = matches.get(matchID);
    if (!match) {
      throw new Error('Match not found');
    }

    const move = AquaponicsGame.moves[moveName];
    if (!move) {
      throw new Error(`Move ${moveName} not found`);
    }

    try {
      const newG = move(match.G, match.ctx, ...args);
      match.G = newG;
      match.ctx.turn++;
      
      matches.set(matchID, match);
      return { G: newG, ctx: match.ctx };
    } catch (error) {
      throw new Error(`Move failed: ${error.message}`);
    }
  }
}

module.exports = { MatchHandler };