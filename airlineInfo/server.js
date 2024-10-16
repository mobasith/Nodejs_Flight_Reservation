const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
const PORT = 3003;

app.use(express.json());

function connectWithRetry() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass@word1',
    database: 'airlinesdb'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Failed to connect to MySQL. Retrying in 5 seconds...', err);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Connected to MySQL successfully!');
      setupRoutes(connection);
    }
  });

  connection.on('error', (err) => {
    console.error('MySQL connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectWithRetry();
    } else {
      throw err;
    }
  });
}

function setupRoutes(db) {
  app.get('/airline', (req, res) => {
    db.query('SELECT * FROM airlines', (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Error fetching airlines data' });
      } else {
        res.json(results);
      }
    });
  });

  app.post('/airline', async (req, res) => {
    const { flightId, passengerId } = req.body;
    
    try {
      const passengerRes = await axios.get(`http://localhost:3001/passengers/${passengerId}`);
      const flightRes = await axios.get(`http://localhost:3002/flights/${flightId}`);
      
      if (passengerRes.data && flightRes.data) {
        db.query('INSERT INTO airlines (passengerId, flightId) VALUES (?, ?)', 
          [passengerId, flightId], 
          (err, result) => {
            if (err) {
              res.status(500).json({ error: 'Error creating booking' });
            } else {
              res.status(201).json({ message: 'booking created successfully', id: result.insertId });
            }
          }
        );
      } else {
        res.status(400).json({ error: 'Invalid passengerInfo or flightInfo' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error processing booking' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Airlines service running on port ${PORT}`);
  });
}

connectWithRetry();