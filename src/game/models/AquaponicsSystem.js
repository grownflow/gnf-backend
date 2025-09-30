const { Sensor } = require('./Sensor');

class WaterChemistry {
	constructor() {
		this.ammonia = 0;
		this.nitrite = 0;
		this.nitrate = 10;
		this.pH = 7.0;
		this.temperature = 22;
	}

	update(ammoniaInput, plantAbsorption, biofilterEfficiency) {
		this.ammonia += ammoniaInput;
		this.nitrite = this.ammonia * biofilterEfficiency;
		this.nitrate += this.nitrite * biofilterEfficiency;
		this.ammonia = 0;
		this.nitrite = 0;
		this.pH -= 0.01 * (ammoniaInput - plantAbsorption);
		this.pH = Math.max(6.0, Math.min(8.0, this.pH));
	}
}

class AquaponicsSystem {
	constructor() {
		this.fish = {};   // fishId -> fish entity (Fish model kept external in state arrays or future ref)
		this.trays = {};  // trayId -> Tray
		this.water = new WaterChemistry();
		this.biofilterEfficiency = 0.8;
		this.turn = 0;
		this.log = [];

		this.sensors = {
			temperature: new Sensor('Temperature', () => this.water.temperature),
			pH: new Sensor('pH', () => this.water.pH),
			ammonia: new Sensor('Ammonia', () => this.water.ammonia),
			nitrate: new Sensor('Nitrate', () => this.water.nitrate)
		};
	}

	getAveragePlantSize() {
		const trays = Object.values(this.trays);
		if (!trays.length) return 0;
		return trays.reduce((sum, t) => sum + t.getAverageSize(), 0) / trays.length;
	}

	processTurn(fishEntities) {
		this.turn++;
		// Waste production
		const ammoniaProduced = fishEntities.reduce((acc, f) => acc + (f.count * f.ammoniaProductionRate), 0);
		// Plant absorption potential (simplified)
		const potentialAbsorption = Object.values(this.trays).reduce((sum, tray) => sum + (Object.keys(tray.plants).length * 0.05), 0);
		// Grow plants + actual nutrient usage
		let totalPlantGrowth = 0;
		let totalNutrientsUsed = 0;
		Object.values(this.trays).forEach(tray => {
			const { totalGrowth, totalNutrients } = tray.growAll(this.water);
			totalPlantGrowth += totalGrowth;
			totalNutrientsUsed += totalNutrients;
		});
		// Update water chemistry
		this.water.update(ammoniaProduced, totalNutrientsUsed, this.biofilterEfficiency);

		const entry = {
			turn: this.turn,
			timestamp: new Date().toISOString(),
			temperature: this.sensors.temperature.read(),
			pH: this.sensors.pH.read(),
			ammonia: this.sensors.ammonia.read(),
			nitrate: this.sensors.nitrate.read(),
			avgPlantSize: +this.getAveragePlantSize().toFixed(2),
			plantGrowth: +totalPlantGrowth.toFixed(2)
		};
		this.log.push(entry);
		return entry;
	}
}

module.exports = { AquaponicsSystem, WaterChemistry };
