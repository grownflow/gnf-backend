// All moves related to economic aspects of the game
// Handles buying/selling, equipment purchases, market interactions

const { Fish } = require('../models/Fish');
const { Plant } = require('../models/Plant');
const { fishSpecies } = require('../data/fishSpecies');
const { plantSpecies } = require('../data/plantSpecies');

// Equipment definitions with costs and benefits
const EQUIPMENT = {
  // Water quality equipment
  phMeter: { cost: 50, type: 'monitoring', description: 'pH monitoring device' },
  thermometer: { cost: 30, type: 'monitoring', description: 'Water temperature sensor' },
  oxygenMeter: { cost: 80, type: 'monitoring', description: 'Dissolved oxygen sensor' },
  
  // Water treatment equipment
  waterPump: { cost: 120, type: 'system', description: 'Improves water circulation' },
  airPump: { cost: 60, type: 'system', description: 'Increases oxygen levels' },
  biofilter: { cost: 200, type: 'system', description: 'Improves nitrogen cycle efficiency' },
  
  // Growing equipment
  growLight: { cost: 100, type: 'growing', description: 'LED grow light for plants' },
  growBed: { cost: 80, type: 'growing', description: 'Additional growing space' },
  
  // Fish equipment
  fishFood: { cost: 20, type: 'consumable', description: 'High-quality fish food (10 units)' },
  fishTank: { cost: 150, type: 'system', description: 'Additional fish tank capacity' }
};

// Market prices for different products

const economyMoves = {
  // Buy equipment or upgrades
  // Parameters: equipmentType, quantity
  buyEquipment: (G, ctx, equipmentType, quantity = 1) => {
    const equipment = EQUIPMENT[equipmentType];
    if (!equipment) {
      return { ...G, error: `Unknown equipment: ${equipmentType}` };
    }

    const totalCost = equipment.cost * quantity;
    
    if (G.money < totalCost) {
      return { 
        ...G, 
        error: `Insufficient funds. Need $${totalCost}, have $${G.money}`,
        lastAction: { type: 'buyEquipment', equipmentType, success: false, reason: 'insufficient_funds' }
      };
    }

    // Deduct money
    G.money -= totalCost;
    
    // Initialize equipment inventory if it doesn't exist
    if (!G.equipment) {
      G.equipment = {};
    }
    
    // Add equipment to inventory
    if (!G.equipment[equipmentType]) {
      G.equipment[equipmentType] = 0;
    }
    G.equipment[equipmentType] += quantity;
    
    // Apply equipment benefits
    const benefits = applyEquipmentBenefits(G, equipmentType, quantity);
    
    G.lastAction = { 
      type: 'buyEquipment', 
      equipmentType, 
      quantity, 
      cost: totalCost, 
      success: true,
      benefits 
    };
    
    return { ...G };
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
      fishSold.push({ type: fish.type, count: fish.count, value });
      
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
          fishSold.push({ type: fish.type, count: fish.count, value });
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
    const foodCost = EQUIPMENT.fishFood.cost * quantity;
    
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
      equipment: EQUIPMENT,
      success: true 
    };
    
    return { ...G };
  }
};

// Helper function to apply equipment benefits
function applyEquipmentBenefits(G, equipmentType, quantity) {
  const benefits = [];
  
  switch (equipmentType) {
    case 'waterPump':
      // Improve water circulation
      if (!G.waterSystem) G.waterSystem = {};
      G.waterSystem.circulationEfficiency = (G.waterSystem.circulationEfficiency || 1.0) + (0.1 * quantity);
      benefits.push('Improved water circulation');
      break;
      
    case 'airPump':
      // Increase oxygen levels
      if (!G.waterSystem) G.waterSystem = {};
      G.waterSystem.oxygenLevel = (G.waterSystem.oxygenLevel || 8.0) + (0.5 * quantity);
      benefits.push('Increased oxygen levels');
      break;
      
    case 'biofilter':
      // Improve nitrogen cycle efficiency
      if (!G.aquaponicsSystem) {
        const { AquaponicsSystem } = require('../models/AquaponicsSystem');
        G.aquaponicsSystem = new AquaponicsSystem();
      }
      G.aquaponicsSystem.biofilterEfficiency = Math.min(1.0, (G.aquaponicsSystem.biofilterEfficiency || 0.8) + (0.05 * quantity));
      benefits.push('Improved nitrogen cycle efficiency');
      break;
      
    case 'growLight':
      // Improve plant growth
      if (!G.systemModifiers) G.systemModifiers = {};
      G.systemModifiers.plantGrowthRate = (G.systemModifiers.plantGrowthRate || 1.0) + (0.1 * quantity);
      benefits.push('Improved plant growth rate');
      break;
      
    case 'growBed':
      // Add growing capacity
      if (!G.maxPlants) G.maxPlants = 10;
      G.maxPlants += 5 * quantity;
      benefits.push(`Added ${5 * quantity} plant growing capacity`);
      break;
      
    case 'fishTank':
      // Add fish capacity
      if (!G.maxFish) G.maxFish = 20;
      G.maxFish += 10 * quantity;
      benefits.push(`Added ${10 * quantity} fish capacity`);
      break;
  }
  
  return benefits;
}

module.exports = economyMoves;