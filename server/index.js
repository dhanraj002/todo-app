import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Configure CORS properly
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3001', 'https://yourdomain.com'] // Add your production domain
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Security: Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Security: Limit request size
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Simple rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  clientData.count++;
  next();
});

// Serve frontend static files
app.use(express.static(path.join(process.cwd(), 'public')));

// Input validation helper
const validateInput = (input, type) => {
  if (type === 'string') {
    return typeof input === 'string' && input.trim().length > 0 && input.length <= 500;
  }
  if (type === 'date') {
    return typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input);
  }
  if (type === 'id') {
    return typeof input === 'string' && /^\d+$/.test(input);
  }
  if (type === 'boolean') {
    return typeof input === 'boolean' || input === 0 || input === 1;
  }
  return false;
};

let db;
(async () => {
  try {
    // Create data directory if it doesn't exist
    const fs = await import('fs');
    const dataDir = './data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = await open({
      filename: './data/todo.db',
      driver: sqlite3.Database
    });
    await db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    )`);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
})();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// CRUD Endpoints with proper error handling
app.get('/api/tasks', asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  if (date && !validateInput(date, 'date')) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  
  let rows;
  if (date) {
    rows = await db.all('SELECT * FROM tasks WHERE date = ?', date);
  } else {
    rows = await db.all('SELECT * FROM tasks');
  }
  res.json(rows);
}));

app.post('/api/tasks', asyncHandler(async (req, res) => {
  const { title, date } = req.body;
  
  if (!validateInput(title, 'string')) {
    return res.status(400).json({ error: 'Invalid title' });
  }
  if (!validateInput(date, 'date')) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  
  const result = await db.run('INSERT INTO tasks (title, date) VALUES (?, ?)', title.trim(), date);
  res.json({ id: result.lastID, title: title.trim(), date, completed: 0 });
}));

app.put('/api/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, completed } = req.body;
  
  if (!validateInput(id, 'id')) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  if (!validateInput(title, 'string')) {
    return res.status(400).json({ error: 'Invalid title' });
  }
  if (!validateInput(date, 'date')) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  if (!validateInput(completed, 'boolean')) {
    return res.status(400).json({ error: 'Invalid completed status' });
  }
  
  await db.run('UPDATE tasks SET title = ?, date = ?, completed = ? WHERE id = ?', 
    title.trim(), date, completed ? 1 : 0, id);
  res.json({ id: parseInt(id), title: title.trim(), date, completed: completed ? 1 : 0 });
}));

app.delete('/api/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!validateInput(id, 'id')) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  
  await db.run('DELETE FROM tasks WHERE id = ?', id);
  res.json({ success: true });
}));

// Weekly and Monthly summary endpoints
app.get('/api/summary/week', asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  
  if (!validateInput(start, 'date') || !validateInput(end, 'date')) {
    return res.status(400).json({ error: 'Invalid date range' });
  }
  
  const rows = await db.all('SELECT * FROM tasks WHERE date BETWEEN ? AND ?', start, end);
  res.json(rows);
}));

app.get('/api/summary/month', asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  
  if (!validateInput(start, 'date') || !validateInput(end, 'date')) {
    return res.status(400).json({ error: 'Invalid date range' });
  }
  
  const rows = await db.all('SELECT * FROM tasks WHERE date BETWEEN ? AND ?', start, end);
  res.json(rows);
}));

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Fallback to frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 