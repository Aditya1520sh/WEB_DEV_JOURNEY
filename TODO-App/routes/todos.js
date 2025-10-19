// Ye file Express Router define karti hai aur saare CRUD endpoints implement karti hai
const express = require('express');
const db = require('../db');

const router = express.Router();

// Helper: convert db row 'completed' (0/1) ko boolean me convert kare
function mapTodoRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: !!row.completed,
    created_at: row.created_at,
  };
}

// POST /todos -> Create a todo
// Ye route ek naya todo create karta hai aur SQLite DB me store karta hai
router.post('/', (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim() === '') {
    // Input validation: empty title accept nahi karenge
    return res.status(400).json({ error: 'Title is required' });
  }

  const sql = 'INSERT INTO todos (title, description) VALUES (?, ?)';
  db.run(sql, [title.trim(), description || ''], function (err) {
    if (err) {
      console.error('DB insert error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    // this.lastID se naya ID milega
    db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: 'Database read error' });
      res.status(201).json(mapTodoRow(row));
    });
  });
});

// GET /todos -> Read all todos
// Ye route sab todos fetch karta hai DB se aur JSON me bhejta hai
router.get('/', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('DB fetch error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows.map(mapTodoRow));
  });
});

// GET /todos/:id -> Read single todo
// Ye route ek specific todo fetch karta hai ID se
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Todo not found' });
    res.json(mapTodoRow(row));
  });
});

// PUT /todos/:id -> Update a todo
// Ye route todo ko update karta hai (title, description, completed)
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, description, completed } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const completedInt = completed ? 1 : 0;
  const sql = 'UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?';
  db.run(sql, [title.trim(), description || '', completedInt, id], function (err) {
    if (err) {
      console.error('DB update error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Todo not found' });
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err2, row) => {
      if (err2) return res.status(500).json({ error: 'Database read error' });
      res.json(mapTodoRow(row));
    });
  });
});

// DELETE /todos/:id -> Delete a todo
// Ye route ek todo ko DB se delete karta hai
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('DB delete error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({ success: true });
  });
});

module.exports = router;
