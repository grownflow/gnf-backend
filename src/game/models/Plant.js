const { plantSpecies } = require('../data/plantSpecies');

class Plant {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.species = plantSpecies[type];
    if (!this.species) {
      throw new Error(`Unknown plant species: ${type}`);
    }
    
    this.size = 1;
    this.health = 10;
    this.weeksGrown = 0;
  }

  grow(nutrients) {
    // Simple: consume nutrients, grow over time
    // Harvest when weeksGrown >= species.growthPeriod
  }

  canHarvest() {
    return this.weeksGrown >= this.species.growthPeriod;
  }

  getMarketValue() {
    return this.canHarvest() ? this.species.valuePerHead : 0;
  }

  harvest() {
    // TODO: Future inventory system
    // When implemented, this should:
    // - Add plant to player inventory with shelf life countdown
    // - Track quantity and weight
    // - Enable player to bundle for sale or use in recipes
    
    if (!this.canHarvest()) {
      return {
        success: false,
        reason: 'Plant not ready for harvest',
        value: 0
      };
    }

    const harvestValue = this.getMarketValue();

    return {
      success: true,
      value: harvestValue,
      type: this.type,
      quantity: 1
      // TODO: Add to inventory system future
      // inventory: { type: this.type, quantity: 1, shelfLife: this.species.shelfLife }
    };
  }
}

module.exports = { Plant };
