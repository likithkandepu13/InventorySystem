const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const mongoose = require('mongoose');

// Get all guest check-in records (for table/filter/export)
router.get('/all-guests', async (req, res) => {
  try {
    const rooms = await Room.find();
    const guests = rooms.flatMap(room =>
      [
        ...(room.history || []).map(h => ({
          roomNumber: room.number,
          name: h.name,
          phone: h.phone,
          email: h.email,
          amount: h.amount,
          paid: h.paid,
          checkIn: h.checkIn,
          checkOut: h.checkOut,
          status: 'checked out',
        })),
        ...(room.status === 'occupied' && room.guest && room.guest.name ? [{
          roomNumber: room.number,
          name: room.guest.name,
          phone: room.guest.phone,
          email: room.guest.email,
          amount: room.guest.amount,
          paid: room.guest.paid,
          checkIn: room.checkIn,
          checkOut: room.checkOut,
          status: 'occupied',
        }] : [])
      ]
    );
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-in to a room
router.post('/:id/checkin', async (req, res) => {
  try {
    const { name, phone, email, checkIn, amount, paid } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status === 'occupied') return res.status(400).json({ error: 'Room already occupied' });
    room.guest = { name, phone, email, amount, paid };
    room.checkIn = checkIn;
    room.checkOut = null;
    room.status = 'occupied';
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-out from a room
router.post('/:id/checkout', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status === 'available') return res.status(400).json({ error: 'Room already available' });
    // Set checkOut to current time
    const now = new Date();
    if (room.guest && room.guest.name) {
      room.history = room.history || [];
      room.history.push({
        _id: new mongoose.Types.ObjectId(),
        name: room.guest.name,
        phone: room.guest.phone,
        email: room.guest.email,
        amount: room.guest.amount,
        paid: room.guest.paid,
        checkIn: room.checkIn,
        checkOut: now,
      });
    }
    room.guest = {};
    room.checkIn = null;
    room.checkOut = null;
    room.status = 'available';
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit amount and paid status for current guest
router.patch('/:id/guest', async (req, res) => {
  try {
    const { amount, paid } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'occupied' || !room.guest || !room.guest.name) {
      return res.status(400).json({ error: 'No guest to update' });
    }
    if (amount !== undefined) room.guest.amount = amount;
    if (paid !== undefined) room.guest.paid = paid;
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check room availability
router.get('/:id/availability', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ available: room.status === 'available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a guest log entry by room number and history _id (atomic with $pull)
router.delete('/:roomNumber/history/:historyId', async (req, res) => {
  try {
    const { roomNumber, historyId } = req.params;
    const room = await Room.findOneAndUpdate(
      { number: roomNumber },
      { $pull: { history: { _id: historyId } } },
      { new: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
    // Check if the entry was actually removed
    const stillExists = (room.history || []).some(h => String(h._id) === String(historyId));
    if (stillExists) {
      return res.status(404).json({ error: 'Entry not found or could not be deleted' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 