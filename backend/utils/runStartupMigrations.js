const mongoose = require('mongoose');
const Bike = require('../models/Bike');

const migrationSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  appliedAt: { type: Date, default: Date.now },
});

const Migration =
  mongoose.models.Migration || mongoose.model('Migration', migrationSchema);

/**
 * One-time migrations applied automatically on deploy (first server start per DB).
 */
async function runStartupMigrations() {
  const MIGRATION_NAME = 'financeable-default-v1';

  const alreadyApplied = await Migration.findOne({ name: MIGRATION_NAME });
  if (alreadyApplied) return;

  const result = await Bike.updateMany(
    { $or: [{ isFinanceable: false }, { isFinanceable: { $exists: false } }] },
    { $set: { isFinanceable: true } }
  );

  await Migration.create({ name: MIGRATION_NAME });
  console.log(
    `[Migration] ${MIGRATION_NAME}: set isFinanceable=true on ${result.modifiedCount} bike(s).`
  );
}

module.exports = { runStartupMigrations };
