const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

db.get("SELECT email, responseCount, masteryScore FROM Users WHERE email = 'admin@kubic.com'", (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Admin user data:', row);
  }
  db.close();
});
