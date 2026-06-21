const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, (req, res) => {
  const { password } = req.body;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPasswordPlain = process.env.ADMIN_PASSWORD;

  if (!adminPasswordHash && !adminPasswordPlain) {
    console.error('ERROR: Admin credentials are not configured on the server (ADMIN_PASSWORD_HASH or ADMIN_PASSWORD).');
    return res.status(500).json({ message: 'Admin credentials not configured' });
  }

  let isValid = false;

  if (adminPasswordHash) {
    isValid = bcrypt.compareSync(password, adminPasswordHash);
  } else if (adminPasswordPlain) {
    if (adminPasswordPlain === 'admin123') {
      console.warn('WARNING: Admin is using the weak default password "admin123". Please change it immediately.');
    } else {
      console.warn('WARNING: ADMIN_PASSWORD is stored in plain text. Please migrate to ADMIN_PASSWORD_HASH.');
    }
    isValid = (password === adminPasswordPlain);
  }

  if (isValid) {
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
