require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const MONGO_URI = process.env.MONGO_URI;

async function initRooms() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Remove existing rooms
  await Room.deleteMany({});

  // Create 9 rooms
  const rooms = [];
  for (let i = 1; i <= 9; i++) {
    rooms.push({
      number: i,
      status: 'available',
      guest: {},
      checkIn: null,
      checkOut: null,
      inventory: [],
    });
  }

  await Room.insertMany(rooms);
  console.log('Initialized 9 rooms');
  mongoose.disconnect();
}

initRooms(); 