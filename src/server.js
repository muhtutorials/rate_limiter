import express from 'express';
import jwt from 'jsonwebtoken';

import auth from './middleware/auth.js';
import db from './db.js';
import loginRequired from './middleware/loginRequired.js';
import requestRateLimiter from './middleware/requestRateLimiter.js';

const app = express();
const port = 3000;

const appSecretKey = process.env.APP_SECRET_KEY;

app.use(express.json());
app.use(auth);
app.use(requestRateLimiter({
  rates: {
    'public': 100,
    'private': 200
  },
  routes: {
    '/': {
      type: 'public',
      weight: 2
    },
    '/token': {
      type: 'public',
      weight: 5
    },
    '/create': {
      type: 'private',
      weight: 1
    }
  }
}));

app.get('/', async (req, res) => {
  const books = await db.collection('books').find().toArray();
  res.json(books);
});

app.post('/token', async (req, res) => {
  const { username } = req.body;
  const user = await db.collection('users').findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const accessToken = jwt.sign({ username: user.username }, appSecretKey);
  return res.json({ accessToken })
});

app.post('/create', loginRequired, async (req, res) => {
  const { title } = req.body;
  const todo = await db.collection('books').insertOne({ title });
  res.json({id: todo.insertedId});
});

app.listen(port, () => {
  console.log(`Listening on ${port}...`);
});