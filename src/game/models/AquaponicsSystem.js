const { Tank } = require('./Tank');
const { GrowBed } = require('./GrowBed');
const { Light } = require('./Light');

class AquaponicsSystem {
  constructor() {
    this.id = `system_${Date.now()}`;
    this.tank = new Tank(1000);
    this.growBeds = {}; // bedId -> GrowBed
    this.light = new Light();
    this.log = [];
  }

  addGrowBed(bedId, plantType, capacity = 16) {
    const bed = new GrowBed(bedId, plantType, capacity);
    this.growBeds[bedId] = bed;
    return bed;
  }

  getGrowBed(bedId) {
    return this.growBeds[bedId] || null;
  }

  processTurn(fishEntities = [], plants = []) {

    // Calculate total nutrition usage from all grow beds
    let totalNutritionUsage = 0;
    Object.values(this.growBeds).forEach(bed => {
      totalNutritionUsage += bed.calculateNutrientDemand();
    });

    // Let Tank process with fish ammonia and plant nutrition usage
    const tankEntry = this.tank.processTurn(fishEntities, totalNutritionUsage);

    // Grow plants in all beds
    let totalPlantGrowth = 0;
    Object.values(this.growBeds).forEach(bed => {
      const result = bed.growAll(this.tank.water.getStatus());
      totalPlantGrowth += result.totalGrowth;
    });

    const entry = {
      timestamp: new Date().toISOString(),
      waterStatus: this.tank.water.getStatus(),
      totalPlantGrowth: Number(totalPlantGrowth.toFixed(2)),
      totalNutritionUsage: Number(totalNutritionUsage.toFixed(3)),
      growBedCount: Object.keys(this.growBeds).length,
      light: this.light.getStatus()
    };

    this.log.push(entry);
    return entry;
  }

  getStatus() {
    return {
      id: this.id,
      tank: this.tank.getStatus(),
      growBeds: Object.values(this.growBeds).map(bed => bed.getStatus()),
      light: this.light.getStatus()
    };
  }
}

module.exports = { AquaponicsSystem };
