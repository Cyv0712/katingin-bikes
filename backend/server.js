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

app.use(cors(CORS_ORIGIN ? { origin: CORS_ORIGIN } : undefined));
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const bikesRouter = require('./routes/bikes');
app.use('/api/bikes', bikesRouter);

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
