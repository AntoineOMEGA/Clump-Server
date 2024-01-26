const mongoose = require('mongoose');

const clumpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  inviteToken: {
    type: String,
    required: true,
    unique: true
  }
});

const Clump = mongoose.model('Clump', clumpSchema);

module.exports = Clump;
