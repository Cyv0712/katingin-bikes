const mongoose = require('mongoose');
const { warmImageCache } = require('./utils/cacheWarmer');

const MONGO_URI = 'mongodb://127.0.0.1:27017/katinginbikes';

async function verifyWarmer() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for testing cache warmer');
  
  console.time('Warmer Run Time');
  await warmImageCache();
  console.timeEnd('Warmer Run Time');
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

verifyWarmer().catch(console.error);
