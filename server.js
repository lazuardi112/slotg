const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const port = 5001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// --- User Endpoints ---

// Get user data or create a new user if not exists
app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            // User not found, create a new one with default credits
            const defaultCredits = 10000;
            db.run('INSERT INTO users (id, credits) VALUES (?, ?)', [id, defaultCredits], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ id, credits: defaultCredits, rtp: null });
            });
        }
    });
});

// Spin endpoint
app.post('/api/spin', (req, res) => {
    const { userId, bet } = req.body;

    if (!userId || !bet) {
        return res.status(400).json({ error: 'userId and bet are required' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.credits < bet) {
            return res.status(400).json({ error: 'Insufficient credits' });
        }

        db.get('SELECT rtp FROM admin WHERE id = 1', (err, adminSettings) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const globalRtp = adminSettings ? adminSettings.rtp : 95; // Default global RTP if not set
            const effectiveRtp = user.rtp !== null && user.rtp !== undefined ? user.rtp : globalRtp;

            let winAmount = 0;
            const winProbability = effectiveRtp / 100;

            if (Math.random() < winProbability) {
                // Simplified win logic: Win a random multiple of the bet
                const winMultipliers = [1.5, 2, 2.5, 5, 10];
                const randomMultiplier = winMultipliers[Math.floor(Math.random() * winMultipliers.length)];
                winAmount = Math.floor(bet * randomMultiplier);
            }

            const newCredits = user.credits - bet + winAmount;

            db.run('UPDATE users SET credits = ? WHERE id = ?', [newCredits, userId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                // The actual reel symbols would be determined here in a real game
                // For now, we just return the financial outcome
                res.json({
                    win: winAmount > 0,
                    winAmount,
                    credits: newCredits,
                });
            });
        });
    });
});


// --- Admin Endpoints ---

// Simple login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // IMPORTANT: This is a highly insecure login. For demonstration purposes only.
    if (username === 'admin' && password === 'password') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get all users
app.get('/api/admin/users', (req, res) => {
    db.all('SELECT id, credits, rtp FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Set user credits
app.post('/api/admin/user/credits', (req, res) => {
    const { userId, credits } = req.body;
    db.run('UPDATE users SET credits = ? WHERE id = ?', [credits, userId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User credits updated' });
    });
});

// Set user RTP
app.post('/api/admin/user/rtp', (req, res) => {
    const { userId, rtp } = req.body;
    // Allow setting RTP to null to use global RTP
    const rtpValue = rtp === '' || rtp === null ? null : parseInt(rtp, 10);
    db.run('UPDATE users SET rtp = ? WHERE id = ?', [rtpValue, userId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
         if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User RTP updated' });
    });
});


// Get global RTP
app.get('/api/admin/rtp', (req, res) => {
    db.get('SELECT rtp FROM admin WHERE id = 1', (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row || { rtp: 95 }); // Default global RTP
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


// --- Serve Files ---

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
