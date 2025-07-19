import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(process.cwd(), 'public')));

let db;
(async () => {
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
})();

// CRUD Endpoints
app.get('/api/tasks', async (req, res) => {
  const { date } = req.query;
  let rows;
  if (date) {
    rows = await db.all('SELECT * FROM tasks WHERE date = ?', date);
  } else {
    rows = await db.all('SELECT * FROM tasks');
  }
  res.json(rows);
});

app.post('/api/tasks', async (req, res) => {
  const { title, date } = req.body;
  const result = await db.run('INSERT INTO tasks (title, date) VALUES (?, ?)', title, date);
  res.json({ id: result.lastID, title, date, completed: 0 });
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, date, completed } = req.body;
  await db.run('UPDATE tasks SET title = ?, date = ?, completed = ? WHERE id = ?', title, date, completed, id);
  res.json({ id, title, date, completed });
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await db.run('DELETE FROM tasks WHERE id = ?', id);
  res.json({ success: true });
});

// Weekly and Monthly summary endpoints
app.get('/api/summary/week', async (req, res) => {
  const { start, end } = req.query;
  const rows = await db.all('SELECT * FROM tasks WHERE date BETWEEN ? AND ?', start, end);
  res.json(rows);
});

app.get('/api/summary/month', async (req, res) => {
  const { start, end } = req.query;
  const rows = await db.all('SELECT * FROM tasks WHERE date BETWEEN ? AND ?', start, end);
  res.json(rows);
});

// Fallback to frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 