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
}

module.exports = { Plant };
