// All moves related to economic aspects of the game
// Handles buying/selling, equipment purchases, market interactions

const { Fish } = require('../models/Fish');
const { Plant } = require('../models/Plant');
const { fishSpecies } = require('../data/fishSpecies');
const { plantSpecies } = require('../data/plantSpecies');
const { equipment } = require('../data/equipment');

// Market prices for different products
const economyMoves = {
  // Buy equipment or upgrades
  // Parameters: equipmentType, quantity
  buyEquipment: (G, ctx, equipmentType, quantity = 1) => {
    const item = equipment[equipmentType];
    if (!item) {
      return { ...G, error: `Unknown equipment: ${equipmentType}` };
    }

    const totalCost = item.cost * quantity;
    
    if (G.money < totalCost) {
      return { 
        ...G, 
        error: `Insufficient funds. Need $${totalCost}, have $${G.money}`,
        lastAction: { type: 'buyEquipment', equipmentType, success: false, reason: 'insufficient_funds' }
      };
    }

    // Calculate immutable updates
    const updatedMoney = G.money - totalCost;
    const updatedEquipment = {
      ...(G.equipment || {}),
      [equipmentType]: (G.equipment?.[equipmentType] || 0) + quantity
    };
    
    // Apply equipment benefits and get immutable updates
    const { benefits, updates } = applyEquipmentBenefits(G, equipmentType, quantity);
    
    return {
      ...G,
      money: updatedMoney,
      equipment: updatedEquipment,
      ...updates,
      lastAction: { 
        type: 'buyEquipment', 
        equipmentType, 
        quantity, 
        cost: totalCost, 
        success: true,
        benefits 
      }
    };
  },

  // Sell harvested fish
  // Parameters: fishIndex (optional - if not provided, sells all harvestable fish)
  sellFish: (G, ctx, fishIndex = null) => {
    let totalValue = 0;
    let fishSold = [];
    
    if (fishIndex !== null) {
      // Sell specific fish
      const fish = G.fish[fishIndex];
      if (!fish) {
        return { ...G, error: `Fish at index ${fishIndex} not found` };
      }
      
      if (!fish.isHarvestable()) {
        return { 
          ...G, 
          error: `Fish not ready for harvest (size: ${fish.size.toFixed(1)}g, needed: ${fish.species.harvestWeight}g)`,
          lastAction: { type: 'sellFish', success: false, reason: 'not_harvestable' }
        };
      }
      
      const value = fish.getMarketValue();
      totalValue = value;
      fishSold.push({ type: fish.type, weight: fish.size, value });
      
      // Remove fish from system
      G.fish.splice(fishIndex, 1);
    } else {
      // Sell all harvestable fish
      const harvestableFish = G.fish.filter(fish => fish.isHarvestable());
      
      if (harvestableFish.length === 0) {
        return { 
          ...G, 
          error: 'No fish ready for harvest',
          lastAction: { type: 'sellFish', success: false, reason: 'no_harvestable_fish' }
        };
      }
      
      // Calculate total value and remove fish
      for (let i = G.fish.length - 1; i >= 0; i--) {
        const fish = G.fish[i];
        if (fish.isHarvestable()) {
          const value = fish.getMarketValue();
          totalValue += value;
          fishSold.push({ type: fish.type, weight: fish.size, value });
          G.fish.splice(i, 1);
        }
      }
    }
    
    // Add money to player
    G.money += totalValue;
    
    G.lastAction = { 
      type: 'sellFish', 
      fishSold, 
      totalValue, 
      success: true 
    };
    
    return { ...G };
  },

  // Sell harvested plants
  // Parameters: plantId (optional - if not provided, sells all harvestable plants)
  sellPlants: (G, ctx, plantId = null) => {
    let totalValue = 0;
    let plantsSold = [];
    
    if (plantId !== null) {
      // Sell specific plant
      const plantIndex = G.plants.findIndex(p => p.id === plantId);
      if (plantIndex === -1) {
        return { ...G, error: `Plant with ID ${plantId} not found` };
      }
      
      const plant = G.plants[plantIndex];
      const harvestResult = plant.harvest();
      
      if (!harvestResult.success) {
        return { 
          ...G, 
          error: harvestResult.reason,
          lastAction: { type: 'sellPlants', success: false, reason: harvestResult.reason }
        };
      }
      
      totalValue = harvestResult.value;
      plantsSold.push({ type: plant.type, value: harvestResult.value });
      
      // Remove plant from system
      G.plants.splice(plantIndex, 1);
    } else {
      // Sell all harvestable plants
      const harvestablePlants = G.plants.filter(plant => plant.canHarvest());
      
      if (harvestablePlants.length === 0) {
        return { 
          ...G, 
          error: 'No plants ready for harvest',
          lastAction: { type: 'sellPlants', success: false, reason: 'no_harvestable_plants' }
        };
      }
      
      // Calculate total value and remove plants
      for (let i = G.plants.length - 1; i >= 0; i--) {
        const plant = G.plants[i];
        if (plant.canHarvest()) {
          const harvestResult = plant.harvest();
          if (harvestResult.success) {
            totalValue += harvestResult.value;
            plantsSold.push({ type: plant.type, value: harvestResult.value });
            G.plants.splice(i, 1);
          }
        }
      }
    }
    
    // Add money to player
    G.money += totalValue;
    
    G.lastAction = { 
      type: 'sellPlants', 
      plantsSold, 
      totalValue, 
      success: true 
    };
    
    return { ...G };
  },

  // Buy fish food
  // Parameters: quantity (in units of 10)
  buyFishFood: (G, ctx, quantity = 1) => {
    const foodCost = equipment.fishFood.cost * quantity;
    
    if (G.money < foodCost) {
      return { 
        ...G, 
        error: `Insufficient funds. Need $${foodCost}, have $${G.money}`,
        lastAction: { type: 'buyFishFood', success: false, reason: 'insufficient_funds' }
      };
    }
    
    G.money -= foodCost;
    
    // Initialize fish food inventory
    if (!G.fishFood) {
      G.fishFood = 0;
    }
    G.fishFood += quantity * 10; // Each purchase gives 10 units
    
    G.lastAction = { 
      type: 'buyFishFood', 
      quantity: quantity * 10, 
      cost: foodCost, 
      success: true 
    };
    
    return { ...G };
  },

  // Skip turn to advance time and save energy
  skipTurn: (G, ctx) => {
    // Advance game time
    G.gameTime += 1;
    
    // Run background simulations if aquaponics system exists
    if (G.aquaponicsSystem) {
      G.aquaponicsSystem.processTurn(G.fish || []);
    }
    
    // Regenerate some money over time (passive income from system)
    const passiveIncome = 5; // Small amount per turn
    G.money += passiveIncome;
    
    G.lastAction = { 
      type: 'skipTurn', 
      timeAdvanced: 1, 
      passiveIncome,
      success: true 
    };
    
    return { ...G };
  },

  // Get current market prices
  getMarketPrices: (G, ctx) => {
    const prices = {
      fish: {},
      plants: {}
    };
    
    // Add fish prices
    Object.keys(fishSpecies).forEach(species => {
      prices.fish[species] = fishSpecies[species].marketValue;
    });
    
    // Add plant prices
    Object.keys(plantSpecies).forEach(species => {
      prices.plants[species] = plantSpecies[species].valuePerHead;
    });
    
    G.lastAction = { 
      type: 'getMarketPrices', 
      prices,
      success: true 
    };
    
    return { ...G };
  },

  // Get available equipment for purchase
  getEquipmentCatalog: (G, ctx) => {
    G.lastAction = { 
      type: 'getEquipmentCatalog', 
      equipment: equipment,
      success: true 
    };
    
    return { ...G };
  },

  // Buy fish fingerlings
  // Parameters: fishType (e.g., 'tilapia', 'barramundi'), count
  buyFish: (G, ctx, fishType, count = 1) => {
    const species = fishSpecies[fishType.toLowerCase()];
    if (!species) {
      return { 
        ...G, 
        error: `Unknown fish species: ${fishType}`,
        lastAction: { type: 'buyFish', fishType, success: false, reason: 'unknown_species' }
      };
    }

    const totalCost = species.fingerlingCost * count;
    
    if (G.money < totalCost) {
      return { 
        ...G, 
        error: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${G.money.toFixed(2)}`,
        lastAction: { type: 'buyFish', fishType, count, success: false, reason: 'insufficient_funds' }
      };
    }

    // Deduct money
    const updatedMoney = G.money - totalCost;
    
    // Add fish to system
    const { Fish } = require('../models/Fish');
    const newFish = new Fish(fishType, count);
    const updatedFish = [...G.fish, newFish];
    
    return {
      ...G,
      money: updatedMoney,
      fish: updatedFish,
      lastAction: { 
        type: 'buyFish', 
        fishType, 
        count, 
        cost: totalCost, 
        success: true 
      }
    };
  },

  // Buy plant seeds and plant them in a grow bed
  // Parameters: plantType (e.g., 'ParrisIslandRomaine'), bedLocation, count
  buyPlantSeeds: (G, ctx, plantType, bedLocation, count = 1) => {
    const species = plantSpecies[plantType];
    if (!species) {
      return { 
        ...G, 
        error: `Unknown plant species: ${plantType}`,
        lastAction: { type: 'buyPlantSeeds', plantType, success: false, reason: 'unknown_species' }
      };
    }

    const totalCost = species.seedCost * count;
    
    if (G.money < totalCost) {
      return { 
        ...G, 
        error: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${G.money.toFixed(2)}`,
        lastAction: { type: 'buyPlantSeeds', plantType, count, success: false, reason: 'insufficient_funds' }
      };
    }

    // Deduct money
    let updatedG = { ...G, money: G.money - totalCost };
    
    // Plant seeds in the grow bed
    const { Plant } = require('../models/Plant');
    const { GrowBed } = require('../models/GrowBed');
    
    const plantsAdded = [];
    for (let i = 0; i < count; i++) {
      const plant = new Plant(Date.now() + i, plantType);
      plant.location = bedLocation;
      plant.plantedAt = updatedG.gameTime;
      
      // Ensure grow bed exists
      if (!updatedG.aquaponicsSystem.growBeds[bedLocation]) {
        updatedG.aquaponicsSystem.growBeds[bedLocation] = new GrowBed(bedLocation, plantType, 16);
      }
      
      const bed = updatedG.aquaponicsSystem.growBeds[bedLocation];
      bed.addPlant(plant);
      updatedG.plants.push(plant);
      plantsAdded.push(plant.id);
    }
    
    updatedG.lastAction = { 
      type: 'buyPlantSeeds', 
      plantType, 
      bedLocation,
      count, 
      cost: totalCost,
      plantsAdded,
      success: true 
    };
    
    return updatedG;
  }
};

// Helper function to apply equipment benefits
// Returns { benefits: string[], updates: object } with immutable state updates
function applyEquipmentBenefits(G, equipmentType, quantity) {
  const benefits = [];
  const updates = {};
  
  switch (equipmentType) {
    case 'waterPump':
      // Improve water circulation
      updates.waterSystem = {
        ...(G.waterSystem || {}),
        circulationEfficiency: (G.waterSystem?.circulationEfficiency || 1.0) + (0.1 * quantity)
      };
      benefits.push('Improved water circulation');
      break;
      
    case 'airPump':
      // Increase oxygen levels
      updates.waterSystem = {
        ...(G.waterSystem || {}),
        oxygenLevel: (G.waterSystem?.oxygenLevel || 8.0) + (0.5 * quantity)
      };
      benefits.push('Increased oxygen levels');
      break;
      
    case 'biofilter': {
      // Improve nitrogen cycle efficiency
      const { AquaponicsSystem } = require('../models/AquaponicsSystem');
      if (!G.aquaponicsSystem) {
        const newSystem = new AquaponicsSystem();
        newSystem.biofilterEfficiency = 0.8 + (0.05 * quantity);
        updates.aquaponicsSystem = newSystem;
      } else {
        // Create a new instance with updated efficiency, copying existing properties
        const newSystem = new AquaponicsSystem();
        // Copy existing properties from the old system
        if (G.aquaponicsSystem.tank) newSystem.tank = G.aquaponicsSystem.tank;
        if (G.aquaponicsSystem.growBeds) newSystem.growBeds = G.aquaponicsSystem.growBeds;
        if (G.aquaponicsSystem.light) newSystem.light = G.aquaponicsSystem.light;
        if (G.aquaponicsSystem.log) newSystem.log = G.aquaponicsSystem.log;
        // Update biofilter efficiency
        newSystem.biofilterEfficiency = Math.min(1.0, (G.aquaponicsSystem.biofilterEfficiency || 0.8) + (0.05 * quantity));
        updates.aquaponicsSystem = newSystem;
      }
      benefits.push('Improved nitrogen cycle efficiency');
      break;
    }
      
    case 'growLight':
      // Improve plant growth
      updates.systemModifiers = {
        ...(G.systemModifiers || {}),
        plantGrowthRate: (G.systemModifiers?.plantGrowthRate || 1.0) + (0.1 * quantity)
      };
      benefits.push('Improved plant growth rate');
      break;
      
    case 'growBed':
      // Add growing capacity
      updates.maxPlants = (G.maxPlants || 10) + (5 * quantity);
      benefits.push(`Added ${5 * quantity} plant growing capacity`);
      break;
      
    case 'fishTank':
      // Add fish capacity
      updates.maxFish = (G.maxFish || 20) + (10 * quantity);
      benefits.push(`Added ${10 * quantity} fish capacity`);
      break;
  }
  
  return { benefits, updates };
}

module.exports = economyMoves;