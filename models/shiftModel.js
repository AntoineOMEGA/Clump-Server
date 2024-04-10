const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  eventTemplateID: {
    type: String,
    required: true,
  },

  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const Shift = mongoose.model('shift', shiftSchema);

module.exports = Shift;
