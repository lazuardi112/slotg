const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('slot_machine.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      credits INTEGER,
      rtp INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rtp INTEGER
    )
  `);
});

module.exports = db;
