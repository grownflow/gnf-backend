// Main game definition for boardgame.io
// Imports moves from modular files and defines core game structure

// Import all moves from the moves directory
const moves = require('./moves');
const { AquaponicsSystem } = require('./models/AquaponicsSystem');

const AquaponicsGame = {
  // Game identifier - used in API endpoints (/games/aquaponics/...)
  name: "aquaponics",
  
  // Initial game state when a new game is created
  // This represents a fresh aquaponics system with no fish or plants
  setup: () => ({
    // Individual entities as arrays - each fish/plant is a separate object
    fish: [],     // Array of fish objects with individual properties
    plants: [],   // Array of plant objects in various grow beds
    
    // Core aquaponics system with Tank, GrowBeds, Light
    aquaponicsSystem: new AquaponicsSystem(),

    // Game mechanics and player resources
    gameTime: 0,    // DAYS since game start
    money: 5000,    // Player currency for purchases and upgrades
    
    // Utility bills tracking
    billsAccrued: {
      electricity: 0, // Accumulated electricity costs
      water: 0        // Accumulated water costs
    },
    lastBillPaid: 0   // Game day of last bill payment
  }),

  // Import all moves from the modular move files
  // This keeps the main game file clean while allowing complex move logic
  moves
  // Turn structure and phases can be added here as the game grows
  // turn: { ... }, only need turns if multiplayer added.
  // phases: { ... }, used for diff game states that allow diff moves
};

// Export the game so it can be used by the boardgame.io server
module.exports = { AquaponicsGame };