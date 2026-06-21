const mongoose = require('mongoose');
require('dotenv').config();

// Define schema inline to match the Bike model
const BikeSchema = new mongoose.Schema({
  images: [String]
}, { strict: false });

const Bike = mongoose.model('Bike', BikeSchema);

async function run() {
  // Use your database URI. 
  // If running locally, make sure your .env has your MongoDB Atlas URI configured.
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('ERROR: MONGO_URI is not defined in your environment or .env file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const bikes = await Bike.find({});
    console.log(`Found ${bikes.length} listings in database.`);

    let updatedCount = 0;

    for (const bike of bikes) {
      if (bike.images && bike.images.length > 0) {
        let changed = false;

        const newImages = bike.images.map(imgUrl => {
          if (imgUrl && imgUrl.includes('res.cloudinary.com')) {
            // Extract the filename (e.g. "1712345678-123456.webp") from the end of the URL
            const filename = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
            changed = true;
            return `/uploads/${filename}`;
          }
          return imgUrl;
        });

        if (changed) {
          bike.images = newImages;
          bike.markModified('images');
          await bike.save();
          console.log(`Updated images for listing ID: ${bike._id}`);
          updatedCount++;
        }
      }
    }

    console.log(`\nMigration completed! Successfully updated ${updatedCount} listings.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
