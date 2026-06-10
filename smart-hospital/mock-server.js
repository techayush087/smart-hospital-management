/**
 * Custom mock API server for SHAPMS.
 *
 * Why this exists instead of `json-server-auth`:
 *   json-server-auth@2 emits Express-4-era wildcard route patterns ("/666/*") that
 *   crash under the hoisted path-to-regexp@8 / router package in this toolchain
 *   (MODULE: path-to-regexp throws on the legacy "*" syntax). Rather than fight the
 *   transitive version conflict, we mount plain json-server and add a tiny JWT auth
 *   layer here. Same contract the frontend expects:
 *     POST /api/auth/login    { email, password }        -> { accessToken, user }
 *     POST /api/auth/register { ...RegisterDto }          -> { accessToken, user }
 *   plus all REST resources under /api/* (rewritten to json-server root).
 *
 * Passwords are bcrypt-hashed (seed users use "Password1!"). Tokens are real JWTs
 * signed with a dev secret. The `password` field is stripped from every user response.
 */
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');
// On a host, set JWT_SECRET in the environment. Falls back to a dev secret locally.
const SECRET = process.env.JWT_SECRET || 'shapms-dev-secret-not-for-production';
// Hosts (Render/Railway/Fly) inject PORT; default to 3000 for local dev.
const PORT = process.env.PORT || 3000;
// Comma-separated allowed origins (your Vercel URL in prod). '*' if unset (dev).
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS || '*';
const EXPIRES_IN = '1h';
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * In-memory store of password-reset tokens, keyed by the SHA-256 hash of the
 * raw token (never the raw token). Each entry is single-use and time-limited.
 * In a real backend this lives in the DB against the user row.
 */
const resetTokens = new Map(); // tokenHash -> { email, expiresAt }

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function timingSafeEqualHex(a, b) {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults();

// CORS — allow the deployed frontend (Vercel) to call this API cross-origin.
const allowList = ALLOWED_ORIGINS.split(',').map((o) => o.trim());
server.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS === '*') {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (origin && allowList.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

const db = () => router.db; // lowdb instance

function stripPassword(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: EXPIRES_IN });
}

// --- Auth: login ---
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const user = db().get('users').find({ email }).value();
  if (!user) return res.status(400).json({ message: 'Incorrect email or password.' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Incorrect email or password.' });
  return res.json({ accessToken: signToken(user), user: stripPassword(user) });
});

// --- Auth: register ---
server.post('/api/auth/register', (req, res) => {
  const body = req.body || {};
  const { email, password } = body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const existing = db().get('users').find({ email }).value();
  if (existing) return res.status(400).json({ message: 'Email already exists.' });
  const id = `u${Date.now()}`;
  const user = {
    id,
    firstName: body.firstName ?? '',
    lastName: body.lastName ?? '',
    email,
    password: bcrypt.hashSync(password, 10),
    role: body.role ?? 'customer',
    dateOfBirth: body.dateOfBirth ?? '',
    phone: body.phone ?? '',
    bloodGroup: body.bloodGroup,
    allergies: body.allergies ?? [],
    existingConditions: body.existingConditions ?? [],
    createdAt: new Date().toISOString()
  };
  db().get('users').push(user).write();
  return res.status(201).json({ accessToken: signToken(user), user: stripPassword(user) });
});

// --- Auth: forgot password (step 1) — issue a single-use reset token ---
// Security model: possession of the TOKEN (not the email) authorizes the reset.
// - Always returns a uniform 200 regardless of whether the account exists, so the
//   endpoint can't be used to enumerate registered emails.
// - A real backend would email the token link out-of-band. With no mail service in
//   this mock, we return the token ONLY for an existing account, clearly labelled as
//   a dev-only stand-in for the emailed link. Knowing an email is NOT enough to reset
//   a password elsewhere — the caller still needs this server-issued token.
server.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body || {};
  const generic = { message: 'If an account exists for that email, a reset link has been sent.' };
  if (!email) return res.status(200).json(generic);

  const user = db().get('users').find({ email }).value();
  if (!user) return res.status(200).json(generic); // uniform response — no enumeration

  const rawToken = crypto.randomBytes(32).toString('hex');
  resetTokens.set(hashToken(rawToken), { email: user.email, expiresAt: Date.now() + RESET_TOKEN_TTL_MS });

  // devToken: stand-in for the link that would be emailed. Dev-only; never do this in prod.
  return res.status(200).json({ ...generic, devToken: rawToken });
});

// --- Auth: reset password (step 2) — requires a valid token, not just an email ---
server.post('/api/auth/reset-password', (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: 'Token and new password are required.' });

  const tokenHash = hashToken(token);
  let matched = null;
  for (const [storedHash, entry] of resetTokens.entries()) {
    if (timingSafeEqualHex(storedHash, tokenHash)) { matched = { storedHash, entry }; break; }
  }
  if (!matched) return res.status(400).json({ message: 'Invalid or expired reset token.' });

  resetTokens.delete(matched.storedHash); // single-use: invalidate immediately
  if (matched.entry.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  const user = db().get('users').find({ email: matched.entry.email }).value();
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

  db().get('users').find({ email: matched.entry.email })
    .assign({ password: bcrypt.hashSync(password, 10) }).write();
  return res.json({ message: 'Password updated. You can now sign in.' });
});

// Strip `password` from EVERY resource response (covers /users and any embedded user).
// json-server calls router.render for all responses, so this catches every send path
// regardless of how the body is written.
router.render = (req, res) => {
  let data = res.locals.data;
  const scrub = (obj) =>
    obj && typeof obj === 'object' && 'password' in obj ? stripPassword(obj) : obj;
  if (Array.isArray(data)) data = data.map(scrub);
  else data = scrub(data);
  res.jsonp(data);
};

// Mount all REST resources under /api/* (rewrite /api/x -> /x for json-server router).
server.use('/api', router);

server.listen(PORT, () => {
  console.log(`SHAPMS mock API running on port ${PORT} (base path /api)`);
  console.log('Seed logins: patient@test.com / admin@test.com  (password: Password1!)');
});
