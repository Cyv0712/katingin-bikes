// Run with: npm test  (needs a MongoDB; defaults to the local one on 27017)
// Resend is stubbed: nothing is ever sent.
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');

const OWNER_KEY = 'o'.repeat(32); // above the 24-character minimum
process.env.OWNER_API_KEY = OWNER_KEY;
process.env.RESEND_API_KEY = 'test-key';
process.env.INQUIRY_RECEIVER_EMAIL = 'owner@example.com';
delete process.env.SITE_URL;

// The real limiter allows 10 inquiries per hour per IP; these tests send more, so use a pass-through
const limiterPath = require.resolve('../middleware/rateLimiter');
require.cache[limiterPath] = {
  id: limiterPath, filename: limiterPath, loaded: true,
  exports: { inquiryLimiter: (req, res, next) => next(), ownerLimiter: (req, res, next) => next() },
};

const Bike = require('../models/Bike');
const BikeLead = require('../models/BikeLead');
const InquirySource = require('../models/InquirySource');

const TEST_DB = `katinginbikes_test_inq_${process.pid}_${Date.now()}`;
const BASE_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';

let server;
let base;
let sent; // payloads "sent" to Resend
const realFetch = global.fetch;

const payload = (over = {}) => ({
  name: 'Juan Dela Cruz',
  email: 'juan@example.com',
  contactNumber: '09171234567',
  unitInterested: 'Honda CB500X',
  message: 'Hello',
  ...over,
});
const submit = (body) => realFetch(`${base}/api/inquiries`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

before(async () => {
  await mongoose.connect(`${BASE_URI}/${TEST_DB}`, { serverSelectionTimeoutMS: 3000 });
  const app = express();
  app.use(express.json());
  app.use('/api/inquiries', require('../routes/inquiries'));
  app.use('/api/internal', require('../routes/internal'));
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;

  // Only Resend is intercepted; requests to the test server go through
  global.fetch = async (url, init) => {
    if (String(url).startsWith('https://api.resend.com')) {
      sent.push(JSON.parse(init.body));
      return { ok: true, status: 200, json: async () => ({ id: 'test-id' }), text: async () => '' };
    }
    return realFetch(url, init);
  };
});

after(async () => {
  global.fetch = realFetch;
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  sent = [];
  await Promise.all([Bike.deleteMany({}), BikeLead.deleteMany({}), InquirySource.deleteMany({})]);
});

const makeBike = () => Bike.create({
  brand: 'Honda', model: 'CB500X', type: 'Adventure', year: 2022, mileage: '5,000 km', price: '₱ 450,000',
});

describe('POST /api/inquiries email', () => {
  it('sets Reply-To to the visitor and links the unit they asked about', async () => {
    const bike = await makeBike();
    const res = await submit(payload({ bikeId: String(bike._id) }));
    assert.equal(res.status, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].reply_to, 'juan@example.com');
    assert.ok(sent[0].html.includes(`https://www.katinginbikes.com/bike/${bike._id}`));
    assert.ok(sent[0].html.includes('View this bike on the website'));
  });

  it('still sends, without a link, when there is no bikeId', async () => {
    const res = await submit(payload());
    assert.equal(res.status, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].reply_to, 'juan@example.com');
    assert.ok(!sent[0].html.includes('/bike/'));
  });

  it('gives no link for an unknown id, or for anything that is not a plain 24-char hex id', async () => {
    const hostile = [
      'ffffffffffffffffffffffff',            // well formed, no such bike
      'not-an-id',
      '"><script>alert(1)</script>',
      'https://evil.example/phish',
      '64b7f0c2a1b2c3d4e5f60718/../x',
    ];
    for (const bikeId of hostile) {
      const res = await submit(payload({ bikeId }));
      assert.equal(res.status, 200, bikeId);
    }
    // an object (query operator) must not be accepted either
    assert.equal((await submit(payload({ bikeId: { $ne: null } }))).status, 200);
    assert.equal(sent.length, hostile.length + 1);
    for (const mail of sent) {
      assert.ok(!mail.html.includes('/bike/'), 'no listing link expected');
      assert.ok(!mail.html.includes('evil.example'));
    }
  });

  it('leaves Reply-To out when the address is not plausible, but keeps the inquiry', async () => {
    for (const email of ['not-an-email', 'a b@example.com', 'x@y.com\r\nBcc: attacker@evil.example', 'a@b']) {
      const res = await submit(payload({ email }));
      assert.equal(res.status, 200, email);
    }
    assert.equal(sent.length, 4);
    for (const mail of sent) assert.equal('reply_to' in mail, false);
  });

  it('puts the raw address in Reply-To but escapes everything inside the HTML', async () => {
    await submit(payload({ name: '<script>alert(1)</script>', email: "o'brien&co@example.com" }));
    assert.equal(sent[0].reply_to, "o'brien&co@example.com");
    assert.ok(!sent[0].html.includes('<script>alert(1)</script>'));
    assert.ok(sent[0].html.includes('&lt;script&gt;'));
  });

  it('still counts the inquiry against the bike', async () => {
    const bike = await makeBike();
    await submit(payload({ bikeId: String(bike._id) }));
    await new Promise((r) => setTimeout(r, 100)); // recordInquiry is fire-and-forget
    const lead = await BikeLead.findOne({ bikeId: bike._id }).lean();
    assert.equal(lead?.inquiryCount, 1);
  });
});

describe('inquiry source', () => {
  const settle = () => new Promise((r) => setTimeout(r, 120)); // recording is fire-and-forget
  const report = async () => (await realFetch(`${base}/api/internal/attribution`, { headers: { 'x-owner-key': OWNER_KEY } })).json();

  it('shows where the visitor came from in the email, and counts it', async () => {
    await submit(payload({ attribution: { source: 'Facebook', medium: 'post', campaign: 'nov-sale' } }));
    await submit(payload({ attribution: { source: 'facebook' } }));
    await submit(payload()); // nothing known: direct
    await settle();

    assert.ok(sent[0].html.includes('Came from'));
    assert.ok(sent[0].html.includes('facebook / post / nov-sale'));
    assert.ok(sent[2].html.includes('direct'));

    const rows = await InquirySource.find({}).sort({ source: 1 }).lean();
    assert.deepEqual(rows.map((r) => [r.source, r.count]), [['direct', 1], ['facebook', 2]]);

    const data = await report();
    assert.deepEqual(data.inquiriesBySource.map((r) => [r.source, r.count]), [['facebook', 2], ['direct', 1]]);
  });

  it('reduces whatever the visitor sends to a short safe tag', async () => {
    const long = 'a'.repeat(100);
    const cases = [
      { source: '"><script>alert(1)</script>' },
      { source: 'l.facebook.com', medium: 'x'.repeat(200) },
      { source: long },
      { source: { $ne: null } },     // an object, not a string
      { source: ['facebook'] },
      { source: '   ' },
      'not-an-object',
      null,
    ];
    for (const attribution of cases) {
      const res = await submit(payload({ attribution }));
      assert.equal(res.status, 200, JSON.stringify(attribution));
    }
    await settle();
    for (const mail of sent) {
      assert.ok(!mail.html.includes('<script>alert'), 'script tag must never reach the email');
      assert.ok(!mail.html.includes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), 'label is capped at 40 characters');
    }
    const rows = await InquirySource.find({}).lean();
    for (const r of rows) assert.match(r.source, /^[a-z0-9._-]{1,40}$/, r.source);
    assert.ok(rows.some((r) => r.source === 'scriptalert1script'), 'hostile text becomes a harmless tag');
    assert.ok(rows.some((r) => r.source === 'l.facebook.com'));
    assert.equal(rows.find((r) => r.source === 'direct').count, 5, 'objects, arrays, blanks and junk all fall back to direct');
  });
});
