const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS refusing MongoDB SRV records (_mongodb._tcp...)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in environment
}

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nandhipriya_electricals';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/nandhipriya_electricals';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed default electrical categories if database is empty
    try {
      const Category = require('../models/Category');
      const count = await Category.countDocuments();
      if (count === 0) {
        const defaultCats = [
          { name: 'Wires & Cables', description: 'Single-core, multi-core, and house wiring cables.' },
          { name: 'Switches & Sockets', description: 'Modular switches, power sockets, plugs, and cover plates.' },
          { name: 'Lights & Bulbs', description: 'LED bulbs, battens, ceiling downlights, and fixtures.' },
          { name: 'MCB & Distribution', description: 'Circuit breakers, isolators, RCCBs, and DB boxes.' },
          { name: 'Pipes & Fittings', description: 'PVC conduit pipes, bends, junction boxes, and saddles.' },
          { name: 'Fans & Appliances', description: 'Ceiling fans, exhaust fans, and electrical appliances.' },
          { name: 'Tools & Accessories', description: 'Electrical tape, testers, screws, and installation supplies.' }
        ];
        await Category.insertMany(defaultCats);
        console.log('⚡ Initialized default electrical categories');
      }
    } catch {
      // Non-fatal if seeding check fails
    }
  } catch (error) {
    console.warn(` Primary MongoDB Connection Error: ${error.message}`);

    // If primary was an Atlas SRV URL that failed, attempt local MongoDB fallback
    if (primaryUri !== localFallbackUri) {
      console.log(`Attempting fallback connection to local MongoDB (127.0.0.1:27017)...`);
      try {
        const localConn = await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`MongoDB Connected via Local Service: ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error(`Local MongoDB Fallback Error: ${localError.message}`);
      }
    }

    console.error(`Tip: Ensure MongoDB Atlas IP is whitelisted (or start local MongoDB).`);
    process.exit(1);
  }
};

module.exports = connectDB;
