const { MatchHandler } = require('../../../src/api/matchHandler');

describe('MatchHandler', () => {
  test('should create a match with valid matchID', () => {
    const result = MatchHandler.create();
    
    expect(result).toHaveProperty('matchID');
    expect(typeof result.matchID).toBe('string');
    expect(result.matchID.length).toBeGreaterThan(0);
  });

  test('should retrieve created match', () => {
    const { matchID } = MatchHandler.create();
    const match = MatchHandler.getMatch(matchID);
    
    expect(match).toBeDefined();
    expect(match).toHaveProperty('G');
    expect(match).toHaveProperty('ctx');
    expect(match.G).toHaveProperty('fish');
    expect(match.G).toHaveProperty('gameTime');
    expect(match.ctx).toHaveProperty('currentPlayer');
  });

  test('should return undefined for non-existent match', () => {
    const match = MatchHandler.getMatch('nonexistent');
    expect(match).toBeUndefined();
  });

  test('should execute addFish move successfully', () => {
    const { matchID } = MatchHandler.create();
    
    const result = MatchHandler.makeMove(matchID, 'addFish', ['tilapia', 3], '0');
    
    expect(result).toHaveProperty('G');
    expect(result).toHaveProperty('ctx');
    expect(result.G.fish).toHaveLength(1);
    expect(result.G.fish[0].type).toBe('tilapia');
    expect(result.G.fish[0].count).toBe(3);
    expect(result.ctx.turn).toBe(2); // Should increment
  });

  test('should execute multiple moves in sequence', () => {
    const { matchID } = MatchHandler.create();
    
    // Add fish
    const addResult = MatchHandler.makeMove(matchID, 'addFish', ['tilapia', 2], '0');
    expect(addResult.G.fish).toHaveLength(1);
    
    // Add tray
    const trayResult = MatchHandler.makeMove(matchID, 'addTray', ['Lettuce'], '0');
    expect(trayResult.G.lastAction.type).toBe('addTray');
    
    // Progress turn
    const progressResult = MatchHandler.makeMove(matchID, 'progressTurn', [], '0');
    expect(progressResult.G.gameTime).toBeGreaterThan(0);
    expect(progressResult.ctx.turn).toBe(4); // Should be at turn 4 after 3 moves
  });

  test('should throw error for non-existent match', () => {
    expect(() => {
      MatchHandler.makeMove('nonexistent', 'addFish', ['tilapia', 1], '0');
    }).toThrow('Match not found');
  });

  test('should throw error for invalid move', () => {
    const { matchID } = MatchHandler.create();
    
    expect(() => {
      MatchHandler.makeMove(matchID, 'invalidMove', [], '0');
    }).toThrow('Move invalidMove not found');
  });

  test('should handle invalid fish index gracefully', () => {
    const { matchID } = MatchHandler.create();
    
    // Try to feed fish when no fish exist - should return unchanged state
    const result = MatchHandler.makeMove(matchID, 'feedFish', [99, 10], '0');
    
    expect(result).toHaveProperty('G');
    expect(result.G.fish).toHaveLength(0); // No fish should be added
    expect(result.ctx.turn).toBe(2); // Turn should still increment
  });
});