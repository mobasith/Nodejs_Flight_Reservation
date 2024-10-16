const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3002;

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pass@word1',
  database: 'flightdb'
});

app.get('/flights', (req, res) => {
  db.query('SELECT * FROM flights', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching flights data' });
    } else {
      res.json(results);
    }
  });
});

app.get('/flights/:id', (req, res) => {
  db.query('SELECT * FROM flights WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching flights data' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'flight not found' });
    } else {
      res.json(results[0]);
    }
  });
});

app.post('/flights', (req, res) => {
  const { name,from_addr,destination  } = req.body;
  db.query('INSERT INTO flights (name,from_addr,destination) VALUES (?, ?,?)', 
    [name, from_addr, destination], 
    (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Error creating flight' });
      } else {
        res.status(201).json({ message: 'flight created successfully', id: result.insertId });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`FlightInfo service running on port ${PORT}`);
});