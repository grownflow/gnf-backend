/*
 * Redo plant file to match excel sheet description
 * | Plant Species | Density | Nutrition needs, harvest time
 * - Leafy greens (kale, lettuce) - 
 * -
 * 
/*/

class Plant {
	constructor(id, type, options = {}) {
		this.id = id;
		this.type = type;
		this.size = 1;           // Overall biomass proxy
		this.health = 10;        // 1-10 scale
		this.maturity = 1;       // 1-10 scale for harvest readiness
		this.growthRate = options.growthRate || 0.05;
		this.pHRange = options.pHRange || [6.0, 7.5];
		this.temperatureRange = options.temperatureRange || [18, 26];
		this.nutrientDemand = options.nutrientDemand || 0.05; // Nitrate per cycle
		this.lightRequirement = options.lightRequirement || 'full sun';
	}

	grow(water) {
		const { nitrate, pH, temperature } = water;
		const tempFactor = (temperature >= this.temperatureRange[0] && temperature <= this.temperatureRange[1]) ? 1 : 0.5;
		const pHFactor = (pH >= this.pHRange[0] && pH <= this.pHRange[1]) ? 1 : 0.5;
		const nutrientFactor = Math.min(nitrate, this.nutrientDemand);
		const stressed = tempFactor < 1 || pHFactor < 1;

		if (stressed) {
			this.health -= 0.5;
		} else {
			this.health = Math.min(10, this.health + 0.2);
		}
		this.health = Math.max(1, this.health);

		const growth = nutrientFactor * tempFactor * pHFactor * (this.health / 10);
		this.size += growth;
		this.maturity = Math.min(10, this.size / 2);

		// Consume nutrients from water handled by caller
		return { growth, nutrientsUsed: nutrientFactor };
	}

	canHarvest() {
		return this.maturity >= 8;
	}

	harvest() {
		if (!this.canHarvest()) return 0;
		const yieldAmount = this.size * this.maturity * 0.1;
		// Reset after harvest (simplified mechanic)
		this.size = 1;
		this.maturity = 1;
		this.health = 10;
		return yieldAmount;
	}
}

module.exports = { Plant };
