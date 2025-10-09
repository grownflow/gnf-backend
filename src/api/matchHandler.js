const { getCollection } = require('../db');
const { AquaponicsGame } = require('../game/game');
const { Fish } = require('../game/models/Fish');
const { AquaponicsSystem } = require('../game/models/AquaponicsSystem');

class MatchHandler {
  // Reconstruct class instances from plain objects
  static deserializeGameState(G) {
    const deserialized = {
      ...G,
      fish: (G.fish || []).map(f => 
        Object.assign(new Fish(f.type, f.count), f)
      ),
    };

    // Reconstruct AquaponicsSystem if it exists
    if (G.aquaponicsSystem) {
      const sys = new AquaponicsSystem();
      Object.assign(sys, G.aquaponicsSystem);
      
      // Reconstruct trays and plants within the system
      if (G.aquaponicsSystem.trays) {
        sys.trays = G.aquaponicsSystem.trays;
      }
      
      deserialized.aquaponicsSystem = sys;
    }

    return deserialized;
  }

  static async create() {
    const matchID = Math.random().toString(36).substring(2, 15);
    const G = AquaponicsGame.setup();
    const ctx = {
      currentPlayer: '0',
      turn: 1,
      numPlayers: 1,
      playOrder: ['0'],
      playOrderPos: 0
    };

    const matches = await getCollection('matches');
    await matches.insertOne({
      matchID,
      G,
      ctx,
      players: ['0'],
      gameTime: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { matchID };
  }

  static async getMatch(matchID) {
    const matches = await getCollection('matches');
    const match = await matches.findOne({ matchID });
    
    if (!match) {
      return null;
    }

    // Reconstruct class instances
    const G = this.deserializeGameState(match.G);
    return { G, ctx: match.ctx };
  }

  static async makeMove(matchID, moveName, args, playerID) {
    const match = await this.getMatch(matchID);
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

      const matches = await getCollection('matches');
      await matches.updateOne(
        { matchID },
        {
          $set: {
            G: newG,
            ctx: match.ctx,
            gameTime: newG.gameTime || 0,
            updatedAt: new Date()
          }
        }
      );

      return { G: newG, ctx: match.ctx };
    } catch (error) {
      throw new Error(`Move failed: ${error.message}`);
    }
  }

  static async deleteMatch(matchID) {
    const matches = await getCollection('matches');
    await matches.deleteOne({ matchID });
  }

  static async listMatches(status = 'active', limit = 50) {
    const matches = await getCollection('matches');
    return await matches
      .find({ status })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = { MatchHandler };