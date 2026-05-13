const mongoose = require('mongoose');
const Bike = require('./models/Bike');

mongoose.connect('mongodb://127.0.0.1:27017/jettlaudonedeal')
  .then(async () => {
    console.log('Connected to MongoDB. Seeding bikes...');
    
    // Check if these bikes already exist so we don't duplicate them
    const existing = await Bike.countDocuments();
    if (existing === 0) {
      const bikes = [
        {
          brand: 'BMW',
          model: 'R 1250 GS',
          type: 'Adventure',
          year: 2023,
          mileage: '0 km',
          price: '₱ 1,450,000',
          description: 'The undisputed king of adventure motorcycles. The R 1250 GS brings power, reliability, and unparalleled riding dynamics for crossing continents or navigating city streets.',
          issues: 'None. Mint condition.',
          engineSize: '1254 cc',
          engineConfig: 'Boxer Twin',
          power: '136 HP',
          transmission: '6-Speed Manual',
          image: '' // Intentionally left blank for the user to upload
        },
        {
          brand: 'Kawasaki',
          model: 'Z1000R',
          type: 'Naked',
          year: 2023,
          mileage: '0 km',
          price: '₱ 750,000',
          description: 'A true streetfighter with an aggressive Sugomi design. The Z1000R delivers raw, unadulterated inline-four power, top-tier Brembo brakes, and striking road presence.',
          issues: 'None. Mint condition.',
          engineSize: '1043 cc',
          engineConfig: 'Inline-Four',
          power: '142 HP',
          transmission: '6-Speed Manual',
          image: '' // Intentionally left blank for the user to upload
        },
        {
          brand: 'Honda',
          model: 'Africa Twin DCT',
          type: 'Adventure',
          year: 2023,
          mileage: '0 km',
          price: '₱ 980,000',
          description: 'Built for the relentless adventurer. The Africa Twin DCT offers seamless Dual Clutch Transmission for effortless off-road trails and incredibly smooth highway touring.',
          issues: 'None. Mint condition.',
          engineSize: '1084 cc',
          engineConfig: 'Parallel Twin',
          power: '101 HP',
          transmission: '6-Speed DCT Automatic',
          image: '' // Intentionally left blank for the user to upload
        }
      ];

      await Bike.insertMany(bikes);
      console.log('Successfully seeded 3 best-selling bikes!');
    } else {
      console.log('Database already has bikes, skipping seed to prevent duplicates.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
