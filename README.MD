# Grow-n-Flow Backend

A boardgame.io-powered Node.js backend for the Grow-n-Flow aquaponics simulation game. This server manages real-time aquaponics system simulation with multiplayer support.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone git@github.com:grownflow/gnf-backend.git
cd gnf-backend
```

2. Install dependencies:
```bash
npm install
```

### Running the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The servers will start at:
- Express API server: `http://localhost:4000`
- Boardgame.io server: `http://localhost:8000`

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run specific test suites
npm run test:unit
npm run test:integration
```

### Manual Testing

#### Health Check
```bash
curl http://localhost:4000
```
Expected response: `Aquaponics backend running.`

#### API Health Check
```bash
curl http://localhost:4000/api
```
Expected response: `{"message":"API is running"}`

#### Game Testing

1. **Create a game:**
```bash
curl -X POST http://localhost:8000/games/aquaponics/create \
  -H "Content-Type: application/json" \
  -d '{"numPlayers": 1}'
```

2. **Join the game (replace GAME_ID):**
```bash
curl -X POST http://localhost:8000/games/aquaponics/GAME_ID/join \
  -H "Content-Type: application/json" \
  -d '{"playerID": "0", "playerName": "Player1"}'
```

3. **Test moves (replace GAME_ID):**

Plant a seed:
```bash
curl -X POST http://localhost:8000/games/aquaponics/GAME_ID/move \
  -H "Content-Type: application/json" \
  -d '{"type": "plantSeed", "args": ["lettuce", 1], "playerID": "0"}'
```

Feed fish:
```bash
curl -X POST http://localhost:8000/games/aquaponics/GAME_ID/move \
  -H "Content-Type: application/json" \
  -d '{"type": "feedFish", "args": [1, 10], "playerID": "0"}'
```

Buy equipment:
```bash
curl -X POST http://localhost:8000/games/aquaponics/GAME_ID/move \
  -H "Content-Type: application/json" \
  -d '{"type": "buyEquipment", "args": ["water_heater"], "playerID": "0"}'
```

4. **Check game state:**
```bash
curl http://localhost:8000/games/aquaponics/GAME_ID
```

## 🏗 Architecture

### Dual Server Setup

- **Express API Server** (Port 4000) - REST endpoints for user management, leaderboards, game history
- **Boardgame.io Server** (Port 8000) - Real-time game state management and multiplayer synchronization

### Core Components

- **Aquaponics Simulation Engine** - Core logic for water cycles, nutrients, and plant growth
- **Game Models** - Fish, Plants, Sensors, Trays, and AquaponicsSystem
- **Move System** - Player actions organized by category (fish, plants, water, economy)
- **Constants** - Equipment types, fish species, and plant varieties

## 📁 Project Structure

```
src/
├── index.js                    # Server entry point (dual server setup)
├── app.js                      # Express + boardgame.io configuration
├── game/
│   ├── game.js                 # Main game definition
│   ├── constants/
│   │   ├── equipment.js        # Equipment types and properties
│   │   ├── fishTypes.js        # Fish species definitions
│   │   └── plantTypes.js       # Plant variety definitions
│   ├── models/
│   │   ├── AquaponicsSystem.js # Main system model
│   │   ├── Fish.js             # Fish entity model
│   │   ├── Plant.js            # Plant entity model
│   │   ├── Sensor.js           # Sensor monitoring model
│   │   └── Tray.js             # Growing tray model
│   ├── moves/
│   │   ├── index.js            # Move exports
│   │   ├── economyMoves.js     # Buying/selling actions
│   │   ├── fishMoves.js        # Fish management actions
│   │   ├── plantMoves.js       # Plant management actions
│   │   └── waterMoves.js       # Water system actions
│   └── simulation/
│       ├── fishSimulation.js   # Fish health and behavior
│       ├── plantGrowth.js      # Plant growth algorithms
│       └── waterCycle.js       # Water quality simulation
└── api/
    ├── controllers/            # Business logic
    └── routes/
        └── index.js            # API route definitions
```

## 🎮 Game Features

### Simulation Systems
- **Water Cycle Management** - pH, temperature, flow control
- **Nutrient Systems** - Nitrogen cycle, feeding schedules  
- **Plant Growth** - Realistic growth algorithms based on aquaponics principles
- **Fish Management** - Fish health, feeding, waste production
- **Equipment System** - Pumps, heaters, sensors, and monitoring tools

### Player Actions (Moves)
- **Plant Management** - Plant seeds, harvest crops, manage grow trays
- **Fish Care** - Feed fish, monitor health, manage tank conditions
- **Water Control** - Adjust pH, temperature, flow rates
- **Economy** - Buy equipment, sell harvests, manage resources
- **System Monitoring** - Check sensors, maintain equipment

## 🛠 API Integration

### Boardgame.io Server (Port 8000)
- Real-time game state synchronization
- Move validation and execution
- Multiplayer lobby management
- Turn-based game flow

### Express API Server (Port 4000)
- Custom REST endpoints
- User management
- Game statistics and leaderboards
- Health monitoring at `/`

## 🚀 Development

### Adding New Moves
Define player actions in `src/game/moves/`:
```javascript
// src/game/moves/newMoveCategory.js
export const newMove = (G, ctx, ...args) => {
  // Move validation
  if (!isValidMove(G, ctx, args)) {
    return { ...G, error: 'Invalid move' };
  }
  
  // Update game state
  const newState = { ...G };
  // ... move logic here
  
  return newState;
};
```

### Adding New Models
Create entity models in `src/game/models/`:
```javascript
// src/game/models/NewEntity.js
class NewEntity {
  constructor(id, properties = {}) {
    this.id = id;
    this.properties = properties;
  }
  
  update(deltaTime) {
    // Entity update logic
  }
}

module.exports = NewEntity;
```

### Simulation Updates
Add new simulation features in `src/game/simulation/`:
```javascript
// src/game/simulation/newSimulation.js
export const simulateNewSystem = (gameState, deltaTime) => {
  // Simulation calculations
  const updatedState = { ...gameState };
  // ... simulation logic here
  
  return updatedState;
};
```

## 🧪 Continuous Integration

This project uses GitHub Actions for:
- **Automated Testing** - Runs on Node.js 18.x, 20.x, and 22.x
- **Test Coverage** - Reports coverage to Codecov
- **Build Validation** - Ensures clean builds
- **Deployment Pipeline** - Ready for production deployment

## 🌱 Aquaponics Simulation

This backend simulates real aquaponics principles:
- Symbiotic relationship between fish and plants
- Nitrogen cycle management (ammonia → nitrites → nitrates)
- Water quality monitoring (pH, temperature, dissolved oxygen)
- Sustainable food production mechanics
- Equipment-based system optimization

Built for educational and entertainment purposes to teach aquaponics concepts through interactive gameplay.
