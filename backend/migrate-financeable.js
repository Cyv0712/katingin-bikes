const mongoose = require('mongoose');
require('dotenv').config();
const Bike = require('./models/Bike');

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/katinginbikes';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const toUpdate = await Bike.countDocuments({
      $or: [{ isFinanceable: false }, { isFinanceable: { $exists: false } }],
    });

    console.log(`Found ${toUpdate} bike(s) with financing disabled or unset.`);

    if (toUpdate === 0) {
      console.log('Nothing to update.');
      process.exit(0);
    }

    const result = await Bike.updateMany(
      { $or: [{ isFinanceable: false }, { isFinanceable: { $exists: false } }] },
      { $set: { isFinanceable: true } }
    );

    console.log(`Updated ${result.modifiedCount} bike(s) to isFinanceable: true.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
