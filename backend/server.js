require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');

const server = express();
server.use(cors());
server.use(express.json());

// 日付形式のバリデーション（YYYY-MM-DD）
const isValidDate = (date) => /\d{4}-\d{2}-\d{2}/.test(date);

// ユーザー登録API
server.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const { data, error } = await supabase.from('users').insert([
      { name, email, password: hashedPassword }
    ]);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.error('No data returned after insert');
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const token = jwt.sign({ id: data[0].id, email: data[0].email }, process.env.JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Failed to create user', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ログインAPI
server.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error || !data) {
      console.error('User not found or error occurred', error);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, data.password);
    if (passwordMatch) {
      const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Failed to login user', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

// パスワードリセットリクエストAPI
server.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !data) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const resetToken = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Failed to request password reset', error);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
});

// ミドルウェアで認証
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ノート取得API
server.get('/api/notes/:date', authenticate, async (req, res) => {
  const { date } = req.params;
  const userId = req.user.id;

  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    console.log(`Fetching note for user: ${userId}, date: ${date}`);
    const { data, error } = await supabase.from('notes').select('*').eq('date', date).eq('userId', userId).single();
    if (error || !data) {
      console.log(`No note found for date: ${date}`);
      return res.status(404).json({ error: `No note found for date: ${date}` });
    }
    console.log('Fetched note:', data);
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch note', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// ノート保存API
server.post('/api/notes/:date', authenticate, async (req, res) => {
  const { date } = req.params;
  const userId = req.user.id;
  const { note, exercises } = req.body;

  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  console.log(`Saving note for user: ${userId}, date: ${date}`);
  console.log('Note data:', req.body);
  try {
    const { error } = await supabase.from('notes').upsert([
      { date, note, exercises: JSON.stringify(exercises), userId }
    ]);

    if (error) {
      throw error;
    }

    console.log('Note saved successfully');
    res.status(200).json({ message: 'Note saved successfully' });
  } catch (error) {
    console.error('Failed to save note', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

const port = process.env.PORT || 3001;
server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
