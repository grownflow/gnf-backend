// Equipment definitions with costs and benefits
// All equipment available for purchase in the aquaponics game

const equipment = {
  // Water quality equipment
  phMeter: { 
    cost: 50, 
    type: 'monitoring', 
    description: 'pH monitoring device' 
  },
  thermometer: { 
    cost: 30, 
    type: 'monitoring', 
    description: 'Water temperature sensor' 
  },
  oxygenMeter: { 
    cost: 80, 
    type: 'monitoring', 
    description: 'Dissolved oxygen sensor' 
  },
  
  // Water treatment equipment
  waterPump: { 
    cost: 120, 
    type: 'system', 
    description: 'Improves water circulation' 
  },
  airPump: { 
    cost: 60, 
    type: 'system', 
    description: 'Increases oxygen levels' 
  },
  biofilter: { 
    cost: 200, 
    type: 'system', 
    description: 'Improves nitrogen cycle efficiency' 
  },
  
  // Growing equipment
  growLight: { 
    cost: 100, 
    type: 'growing', 
    description: 'LED grow light for plants' 
  },
  growBed: { 
    cost: 80, 
    type: 'growing', 
    description: 'Additional growing space' 
  },
  
  // Fish equipment
  fishFood: { 
    cost: 20, 
    type: 'consumable', 
    description: 'High-quality fish food (10 units)' 
  },
  fishTank: { 
    cost: 150, 
    type: 'system', 
    description: 'Additional fish tank capacity' 
  }
};

module.exports = { equipment };
