// Run with: npm test  (needs a MongoDB; defaults to the local one on 27017)
// Uses a throwaway database that is dropped afterwards, never the app's own.
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const OWNER_KEY = crypto.randomBytes(16).toString('hex'); // 32 chars, above the 24 minimum
process.env.OWNER_API_KEY = OWNER_KEY;
process.env.JWT_SECRET = 'test-secret';
delete process.env.CORS_ORIGIN;

const Bike = require('../models/Bike');
const BikeActivity = require('../models/BikeActivity');
const { recordBikeAdded } = require('../utils/recordBikeLead');

const TEST_DB = `katinginbikes_test_${process.pid}_${Date.now()}`;
const BASE_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';

let server;
let base;
const authHeader = { Authorization: `Bearer ${jwt.sign({ role: 'admin' }, 'test-secret', { algorithm: 'HS256' })}` };
const ownerHeader = { 'x-owner-key': OWNER_KEY };

const bikeBody = (over = {}) => ({
  brand: 'Honda',
  model: 'CB500X',
  type: 'Adventure',
  year: 2022,
  mileage: '5,000 km',
  price: '₱ 450,000',
  ...over,
});

const post = (body) => fetch(`${base}/api/bikes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...authHeader },
  body: JSON.stringify(body),
});
const getActivity = (query = '', headers = ownerHeader) =>
  fetch(`${base}/api/internal/activity${query}`, { headers });

before(async () => {
  await mongoose.connect(`${BASE_URI}/${TEST_DB}`, { serverSelectionTimeoutMS: 3000 });
  await BikeActivity.init(); // make sure the unique index exists before tests rely on it

  const app = express();
  app.use(express.json());
  app.use('/api/bikes', require('../routes/bikes'));
  app.use('/api/internal', require('../routes/internal'));
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Promise.all([Bike.deleteMany({}), BikeActivity.deleteMany({})]);
});

describe('recordBikeAdded', () => {
  it('stores a snapshot stamped with the bike creation time', async () => {
    const bike = await Bike.create(bikeBody());
    await recordBikeAdded(bike);

    const rows = await BikeActivity.find({}).lean();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].event, 'added');
    assert.equal(String(rows[0].bikeId), String(bike._id));
    assert.equal(rows[0].brand, 'Honda');
    assert.equal(rows[0].price, '₱ 450,000');
    assert.equal(rows[0].occurredAt.getTime(), bike.createdAt.getTime());
  });

  it('is idempotent and keeps the original timestamp on replay', async () => {
    const bike = await Bike.create(bikeBody());
    await recordBikeAdded(bike);
    await recordBikeAdded({ ...bike.toObject(), createdAt: new Date('2030-01-01T00:00:00Z') });

    const rows = await BikeActivity.find({}).lean();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].occurredAt.getTime(), bike.createdAt.getTime());
  });

  it('never throws on bad input', async () => {
    await assert.doesNotReject(() => recordBikeAdded(null));
    await assert.doesNotReject(() => recordBikeAdded({}));
    await assert.doesNotReject(() => recordBikeAdded({ _id: 'not-an-object-id' }));
    assert.equal(await BikeActivity.countDocuments({}), 0);
  });
});

describe('POST /api/bikes logging', () => {
  it('logs an entry whose timestamp matches the created bike', async () => {
    const res = await post(bikeBody({ model: 'Logged Bike' }));
    assert.equal(res.status, 201);
    const created = await res.json();

    const rows = await BikeActivity.find({}).lean();
    assert.equal(rows.length, 1);
    assert.equal(String(rows[0].bikeId), created._id);
    assert.equal(rows[0].model, 'Logged Bike');
    assert.equal(rows[0].occurredAt.toISOString(), created.createdAt);
  });

  it('logs nothing when validation rejects the bike', async () => {
    const res = await post({ brand: 'Yamaha', model: 'Invalid Bike' }); // missing required fields
    assert.equal(res.status, 400);
    assert.equal(await BikeActivity.countDocuments({}), 0);
  });

  it('still returns 201 if the activity log cannot be written', async (t) => {
    t.mock.method(BikeActivity, 'updateOne', async () => { throw new Error('log down'); });
    const res = await post(bikeBody({ model: 'Log Failure Bike' }));
    assert.equal(res.status, 201);
    assert.equal(await Bike.countDocuments({ model: 'Log Failure Bike' }), 1);
  });

  it('keeps the entry after the bike is deleted', async () => {
    const created = await (await post(bikeBody({ model: 'Short Lived' }))).json();
    const del = await fetch(`${base}/api/bikes/${created._id}`, { method: 'DELETE', headers: authHeader });
    assert.equal(del.status, 200);

    const res = await getActivity();
    const body = await res.json();
    assert.equal(body.total, 1);
    assert.equal(body.events[0].model, 'Short Lived');
  });
});

describe('GET /api/internal/activity', () => {
  it('404s without a key and with a wrong key', async () => {
    assert.equal((await getActivity('', {})).status, 404);
    assert.equal((await getActivity('', { 'x-owner-key': 'wrong-key-wrong-key-wrong-key' })).status, 404);
  });

  it('returns events newest first with date-time stamps and window counts', async () => {
    const day = 86400000;
    const now = Date.now();
    await BikeActivity.create([
      { bikeId: new mongoose.Types.ObjectId(), event: 'added', brand: 'A', model: 'old', occurredAt: new Date(now - 40 * day) },
      { bikeId: new mongoose.Types.ObjectId(), event: 'added', brand: 'B', model: 'week', occurredAt: new Date(now - 3 * day) },
      { bikeId: new mongoose.Types.ObjectId(), event: 'added', brand: 'C', model: 'today', price: '₱ 1', occurredAt: new Date(now - 3600000) },
    ]);

    const res = await getActivity();
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.deepEqual(body.events.map((e) => e.model), ['today', 'week', 'old']);
    assert.equal(body.total, 3);
    assert.equal(body.last24h, 1);
    assert.equal(body.last7d, 2);
    assert.equal(body.last30d, 2);
    assert.ok(!Number.isNaN(Date.parse(body.events[0].addedAt)));
    assert.equal(body.events[0].price, '₱ 1');
    assert.ok(!('bikeId' in body.events[0]), 'internal ids are not exposed');
  });

  it('applies limit (clamped, with a safe fallback) and from/to filters', async () => {
    const day = 86400000;
    const now = Date.now();
    await BikeActivity.create(
      Array.from({ length: 5 }, (_, i) => ({
        bikeId: new mongoose.Types.ObjectId(), event: 'added', brand: 'X', model: `m${i}`,
        occurredAt: new Date(now - i * day),
      }))
    );

    assert.equal((await (await getActivity('?limit=2')).json()).events.length, 2);
    assert.equal((await (await getActivity('?limit=0')).json()).events.length, 1); // clamped up to 1
    assert.equal((await (await getActivity('?limit=abc')).json()).events.length, 5); // default 50
    assert.equal((await (await getActivity('?limit=999')).json()).events.length, 5); // clamped to 200

    const from = new Date(now - 2.5 * day).toISOString();
    const filtered = await (await getActivity(`?from=${from}`)).json();
    assert.deepEqual(filtered.events.map((e) => e.model), ['m0', 'm1', 'm2']);
    assert.equal(filtered.total, 5, 'total ignores the list filter');

    const ignored = await (await getActivity('?from=not-a-date')).json();
    assert.equal(ignored.events.length, 5);
  });

  it('returns an empty report when nothing has been logged', async () => {
    const body = await (await getActivity()).json();
    assert.deepEqual(body, { total: 0, last24h: 0, last7d: 0, last30d: 0, events: [] });
  });
});
