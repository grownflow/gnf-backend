/*
 *
 *
 * Plant species
 * 
 * Leafy greens (kale, lettuce):
 * Density - 20-25 plants / m^2
 * Nutrition needs - 40-60g of fish food / m^2 per day. 32% protein diet.
 * Harvest time - 3 to 5 weeks after transplant, 6 to 8 weeks from seed
 * 
 * Fruiting crops (tomatoes, cucumbers):
 * Density - 4 plants / m^2
 * Nutrition needs - 60 - 100 g of fish food / m^2 per day. 32% protein diet
 * Harvest time - 10 to 16 weeks
 * 
 * Ex: Parris Island Romaine:
 * Density - 16 plants / m^2
 * Growth Period - 4 weeks
 * Value:
 * $/head - 2.00
 * $/m^2 - 32.00
 * $/m^2 per week - 8.00
 * 
 * See more on Nutrient needs_growth sheet in Game scenarios_backstories_technical component decisions Excel file
 */

const plantSpecies = {
    ParrisIslandRomaine: {
        density: 16,
        growthPeriod: 4,
        category: 'leafy_green',
        nutritionNeeds: 50,
        proteinRequirement: 32,
        valuePerHead: 2.00,
        valuePerM2: 32.00,
        valuePerM2PerWeek: 8.00,
        tempRange: { min: 10, max: 24, optimal: { min: 15, max: 20 } },
        pHRange: { min: 6.0, max: 7.0, optimal: 6.5 },
        lightHours: 12,
        harvestWeight: 300,
        seedToTransplant: 2,
        transplantToHarvest: 4,
        totalGrowthTime: 6,
        marketAcceptance: 'excellent',
        shelfLife: 7,
        availability: 'year-round'
    }
};

module.exports = { plantSpecies };
