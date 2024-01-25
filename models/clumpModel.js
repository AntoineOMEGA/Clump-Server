const mongoose = require('mongoose');

const clumpSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
  inviteToken: {
    type: String,
    require: true,
    unique: true
  }
});

const Clump = mongoose.model('Clump', clumpSchema);

module.exports = Clump;
