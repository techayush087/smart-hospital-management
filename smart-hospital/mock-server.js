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
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');
const SECRET = 'shapms-dev-secret-not-for-production';
const PORT = 3000;
const EXPIRES_IN = '1h';

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults();

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
  console.log(`SHAPMS mock API running at http://localhost:${PORT}/api`);
  console.log('Seed logins: patient@test.com / admin@test.com  (password: Password1!)');
});
