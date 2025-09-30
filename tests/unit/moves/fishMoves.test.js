const fishMoves = require('../../../src/game/moves/fishMoves');
const { Fish } = require('../../../src/game/models/Fish');

describe('Fish Moves', () => {
  let G, ctx;

  beforeEach(() => {
    // Setup basic game state and context matching game.js setup
    G = {
      fish: [],
      plants: [],
      waterSystem: {
        temperature: 24,
        ph: 7.0,
        ammonia: 0,
        nitrite: 0,
        nitrate: 20,
        oxygenLevel: 8.0
      },
      gameTime: 0,
      money: 500
    };
    ctx = { currentPlayer: '0', turn: 1 };
  });

  test('addFish should add fish to game state', () => {
    const result = fishMoves.addFish(G, ctx, 'tilapia', 5);
    
    expect(result.fish).toHaveLength(1);
    expect(result.fish[0]).toBeInstanceOf(Fish);
    expect(result.fish[0].type).toBe('tilapia');
    expect(result.fish[0].count).toBe(5);
  });

  test('feedFish should feed existing fish and advance time', () => {
    // First add a fish
    const addResult = fishMoves.addFish(G, ctx, 'tilapia', 3);
    
    // Then feed it
    const feedResult = fishMoves.feedFish(addResult, ctx, 0, 10);
    
    expect(feedResult.gameTime).toBe(1);
    expect(feedResult.lastAction).toBeDefined();
    expect(feedResult.lastAction.type).toBe('feedFish');
    expect(feedResult.aquaponicsSystem).toBeDefined();
  });

  test('feedFish should return unchanged state for invalid fish index', () => {
    const result = fishMoves.feedFish(G, ctx, 99, 10);
    
    expect(result).toBe(G); // Should return original state unchanged
  });

  test('addTray should create aquaponics system and add tray', () => {
    const result = fishMoves.addTray(G, ctx, 'Lettuce');
    
    expect(result.aquaponicsSystem).toBeDefined();
    expect(result.lastAction.type).toBe('addTray');
    expect(result.lastAction.plantType).toBe('Lettuce');
  });

  test('progressTurn should advance game time and process simulation', () => {
    // Add some fish first
    const withFish = fishMoves.addFish(G, ctx, 'tilapia', 2);
    
    const result = fishMoves.progressTurn(withFish, ctx);
    
    expect(result.gameTime).toBe(1);
    expect(result.aquaponicsSystem).toBeDefined();
    expect(result.lastAction.type).toBe('progressTurn');
    expect(result.lastAction.entry).toBeDefined();
  });
});