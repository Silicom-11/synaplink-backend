const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String },
  birthDate: { type: String }, // o Date si lo deseas
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  discounts: [{ type: String }]
});

module.exports = mongoose.model('User', userSchema);