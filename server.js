const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const port = 5001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Get user data
app.get('/api/user/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Create or update user data
app.post('/api/user', (req, res) => {
  const { id, credits, rtp } = req.body;
  db.run(
    'INSERT OR REPLACE INTO users (id, credits, rtp) VALUES (?, ?, ?)',
    [id, credits, rtp],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'User data saved' });
    }
  );
});

// Get global RTP
app.get('/api/admin/rtp', (req, res) => {
  db.get('SELECT rtp FROM admin WHERE id = 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Set global RTP
app.post('/api/admin/rtp', (req, res) => {
  const { rtp } = req.body;
  db.run('INSERT OR REPLACE INTO admin (id, rtp) VALUES (1, ?)', [rtp], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Global RTP saved' });
  });
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
