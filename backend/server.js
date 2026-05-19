const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
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

app.use('/api/bikes', bikesRouter);
app.use('/api/auth', authRouter);

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
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));
});
