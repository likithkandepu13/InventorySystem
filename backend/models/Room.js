const mongoose = require('mongoose');

const guestHistorySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: String,
  phone: String,
  email: String,
  amount: Number,
  paid: Boolean,
  checkIn: Date,
  checkOut: Date,
}, { _id: false });

const roomSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  guest: {
    name: String,
    phone: String,
    email: String,
    amount: Number,
    paid: Boolean,
  },
  checkIn: Date,
  checkOut: Date,
  history: [guestHistorySchema],
});

module.exports = mongoose.model('Room', roomSchema); 