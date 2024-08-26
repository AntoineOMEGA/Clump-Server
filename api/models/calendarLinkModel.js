const mongoose = require('mongoose');

const iCalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  scheduleID: {
    type: String,
    required: true,
  }
});

const ICal = mongoose.model('ICal', iCalSchema);

module.exports = ICal;
