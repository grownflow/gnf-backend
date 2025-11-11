require('dotenv').config();
const { getCollection, close } = require('./index');

async function createIndexes() {
  try {
    // Create indexes for matches collection
    const matches = await getCollection('matches');
    
    await matches.createIndex({ matchID: 1 }, { unique: true });
    await matches.createIndex({ players: 1 });
    await matches.createIndex({ gameTime: 1 });
    await matches.createIndex({ status: 1 });
    await matches.createIndex({ createdAt: -1 });
    
    // Create indexes for users collection
    const users = await getCollection('users');
    
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ created_at: -1 });
    await users.createIndex({ role: 1 });
    
    console.log('✅ All indexes created successfully');
    await close();
  } catch (error) {
    console.error('❌ Index creation failed:', error);
    process.exit(1);
  }
}

createIndexes();

