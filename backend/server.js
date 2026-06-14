const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const dns = require('dns');

// Force Node.js to resolve IPv4 addresses first. This prevents ETIMEDOUT fetch errors
// in container/cloud environments (like Render) that do not have fully routed IPv6 networks.
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  } else {
    const crypto = require('crypto');
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('WARNING: JWT_SECRET was not set in .env. Generated a temporary random key for development.');
  }
}

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render/Heroku/etc) to fix rate-limiter X-Forwarded-For issues
app.use(compression());
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const allowedOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(',').map(o => o.trim()) : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const { globalLimiter } = require('./middleware/rateLimiter');
app.use('/api', globalLimiter);

// Routes
const bikesRouter = require('./routes/bikes');
const authRouter = require('./routes/auth');
const inquiriesRouter = require('./routes/inquiries');

app.use('/api/bikes', bikesRouter);
app.use('/api/auth', authRouter);
app.use('/api/inquiries', inquiriesRouter);

// Root Route
app.get('/', (req, res) => {
  res.status(200).send('Katingin Bikes Backend API is running successfully!');
});

// Health check — Render needs an open port quickly; don't wait for Mongo.
app.get('/health', (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(200).json({
    ok: true,
    db: dbOk ? 'connected' : 'pending_or_disconnected',
  });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/katinginbikes';

const host = process.env.HOST || '0.0.0.0';
app.listen(PORT, host, () => {
  console.log(`Server listening on http://${host}:${PORT}`);
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      // Warm up image cache on startup in the background
      const { warmImageCache } = require('./utils/cacheWarmer');
      warmImageCache().catch((err) => console.error('[Startup] Cache warmer error:', err));
    })
    .catch((err) => console.error('Failed to connect to MongoDB', err));
});
