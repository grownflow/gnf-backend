class GrowBed {
  constructor(id, plantType, capacity = 16) {
    this.id = id;
    this.plantType = plantType;
    this.capacity = capacity; // max plants in this bed
    this.plants = {}; // plantId -> Plant instance
    this.nutrientDemand = 0;
  }

  addPlant(plant) {
    if (Object.keys(this.plants).length >= this.capacity) {
      return { success: false, reason: 'Grow bed at capacity' };
    }
    
    this.plants[plant.id] = plant;
    return { success: true };
  }

  removePlant(plantId) {
    delete this.plants[plantId];
  }

  calculateNutrientDemand() {
    this.nutrientDemand = Object.values(this.plants).length * 0.05;
    return this.nutrientDemand;
  }

  growAll(waterStatus) {
    let totalGrowth = 0;
    let totalNutrients = 0;

    Object.values(this.plants).forEach(plant => {
      plant.weeksGrown += 1;
      totalGrowth += 1;
      totalNutrients += 0.05;
    });

    return {
      totalGrowth: Number(totalGrowth.toFixed(2)),
      totalNutrients: Number(totalNutrients.toFixed(3))
    };
  }

  getStatus() {
    return {
      id: this.id,
      plantType: this.plantType,
      capacity: this.capacity,
      plantCount: Object.keys(this.plants).length,
      nutrientDemand: this.nutrientDemand,
      plants: Object.values(this.plants).map(p => ({
        id: p.id,
        type: p.type,
        weeksGrown: p.weeksGrown,
        health: p.health,
        canHarvest: p.canHarvest()
      }))
    };
  }
}

module.exports = { GrowBed };
