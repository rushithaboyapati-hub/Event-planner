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

exports.update = async (req, res) => {
  try {
    const { name, address, city, capacity, facilities } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (address !== undefined) update.address = address;
    if (city !== undefined) update.city = city;
    if (capacity !== undefined) update.capacity = capacity;
    if (facilities !== undefined) update.facilities = facilities;
    const venue = await Venue.findOneAndUpdate({ id: req.params.id }, update, { new: true });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await Venue.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Venue not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
