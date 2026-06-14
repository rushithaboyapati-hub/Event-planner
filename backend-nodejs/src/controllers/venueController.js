const Venue = require('../models/Venue');

exports.getAll = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ id: 1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, address, city, capacity, facilities } = req.body;
    const venue = await Venue.create({ name, address, city, capacity, facilities });
    res.status(201).json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
