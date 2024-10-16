const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/passengerdb', { useNewUrlParser: true, useUnifiedTopology: true });

const Passenger = mongoose.model('Passenger', {
  name: String,
  age:Number,
  phone:String,
  from:String,
  destination: String,
  departureDate: Date,
});

app.get('/passengers', async (req, res) => {
  try {
    const passengers = await Passenger.find();
    res.json(passengers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching passengers' });
  }
});

app.get('/passengers/:id', async (req, res) => {
  try {
    const passengers = await Passenger.findById(req.params.id);
    if (passengers) {
      res.json(passengers);
    } else {
      res.status(404).json({ error: 'passenger not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching passenger' });
  }
});

app.post('/passengers', async (req, res) => {
  try {
    const passengers = new Passenger(req.body);
    await passengers.save();
    res.status(201).json(passengers);
  } catch (error) {
    res.status(500).json({ error: 'Error creating passenger' });
  }
});

app.listen(PORT, () => {
  console.log(`passengers service running on port ${PORT}`);
});
