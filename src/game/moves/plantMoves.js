// All moves related to plant management in the aquaponics system
// Handles planting, harvesting, plant care, grow bed management

const plantMoves = {
  // Plant a seed in a grow bed
  // Parameters: plantType, bedLocation
  plantSeed: (G, ctx, plantType, bedLocation) => {
    console.log(`Player ${ctx.currentPlayer} planted ${plantType} in bed ${bedLocation}`);
    // Add plant object to plants array (fix from previous += 1 error)
    G.plants.push({ 
      id: Date.now(), 
      type: plantType, 
      location: bedLocation, 
      growth: 0,
      plantedAt: G.gameTime,
      health: 100
    });
  },

  // Harvest mature plants
  // Parameters: plantId
  harvestPlant: (G, ctx, plantId) => {
    const plantIndex = G.plants.findIndex(p => p.id === plantId);
    if (plantIndex === -1) {
      return G;
    }

    const plant = G.plants[plantIndex];
    const result = plant.harvest();

    if (result.success) {
      G.money += result.value;
      // TODO: G.inventory.push(result) IF inventory system added
      G.plants.splice(plantIndex, 1);
    }

    return { ...G };
  },

  // Not crucial to the prototype right now.
  // May handle this a different way
  carePlant: (G, ctx, plantId, careType) => {
    console.log(`Player ${ctx.currentPlayer} performed ${careType} on plant ${plantId}`);
    // TODO: Improve plant health, cost energy/money
  }
};

module.exports = plantMoves;