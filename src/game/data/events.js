// Game events - both technical and social
// Events can trigger during gameplay and affect the aquaponics system

const EVENT_TYPES = {
  TECHNICAL: 'technical',
  SOCIAL: 'social'
};

const EVENTS = {
  // Test event - high probability for demonstration
  testEvent: {
    id: 'testEvent',
    type: EVENT_TYPES.SOCIAL,
    name: 'Market Day Bonus',
    description: 'The farmers market is extra busy today!',
    cause: 'Local festival',
    effects: {
      message: 'Great day for sales!'
    },
    duration: 1, // just 1 day
    probability: 0.5, // 50% chance - triggers frequently for testing
    severity: 'low'
  },

  // Technical Events - affect system components
  powerOutage: {
    id: 'powerOutage',
    type: EVENT_TYPES.TECHNICAL,
    name: 'Power Outage',
    description: 'A giant thunderstorm has knocked out power to your facility',
    cause: 'Giant thunderstorm',
    effects: {
      lightsDisabled: true
    },
    duration: 1, // days
    probability: 0.05, // 5% chance per turn
    severity: 'high'
  },

  // Social Events - affect economy/market conditions
  gasPriceSpike: {
    id: 'gasPriceSpike',
    type: EVENT_TYPES.SOCIAL,
    name: 'Gas Price Spike',
    description: 'Gas prices have skyrocketed',
    cause: 'Gas prices have skyrocketed',
    effects: {
      transportCost: 100 // +$100 cost to market
    },
    duration: 5,
    probability: 0.06,
    severity: 'medium'
  }
};

module.exports = {
  EVENTS,
  EVENT_TYPES
};
