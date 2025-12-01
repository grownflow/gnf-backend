// All moves related to plant management in the aquaponics system
// Handles planting, harvesting, plant care, grow bed management

const plantMoves = {
  // Plant a seed in a grow bed
  // Parameters: plantType, bedLocation
  plantSeed: (G, ctx, plantType, bedLocation) => {
    const { Plant } = require('../models/Plant');
    const { GrowBed } = require('../models/GrowBed');
    
    const plant = new Plant(Date.now(), plantType);
    plant.location = bedLocation;
    plant.plantedAt = G.gameTime;
    
    // Add plant to aquaponics system grow bed FIRST
    if (!G.aquaponicsSystem.growBeds[bedLocation]) {
      G.aquaponicsSystem.growBeds[bedLocation] = new GrowBed(bedLocation, plantType, 16);
    }
    
    const bed = G.aquaponicsSystem.growBeds[bedLocation];
    bed.addPlant(plant);
    
    // Add the SAME plant instance to G.plants array
    G.plants.push(plant);
    
    return { ...G };
  },

  harvestPlant: (G, ctx, plantId) => {
    const plantIndex = G.plants.findIndex(p => p.id === plantId);
    if (plantIndex === -1) {
      return G;
    }

    const plant = G.plants[plantIndex];
    const result = plant.harvest();

    if (result.success) {
      G.money += result.value;
      
      // Remove from grow bed
      const bed = G.aquaponicsSystem.growBeds[plant.location];
      if (bed) {
        bed.removePlant(plantId);
      }
      
      // Remove from game state
      G.plants.splice(plantIndex, 1);
      
      G.lastAction = { type: 'harvestPlant', plantId, value: result.value, quality: result.quality };
    } else {
      G.lastAction = { type: 'harvestPlant', plantId, error: result.reason };
    }

    return { ...G };
  },

  // Not crucial to the prototype right now.
  // May handle this a different way
  /*
  carePlant: (G, ctx, plantId, careType) => {
    console.log(`Player ${ctx.currentPlayer} performed ${careType} on plant ${plantId}`);
    // TODO: Improve plant health, cost energy/money
  }
  */
};

module.exports = plantMoves;