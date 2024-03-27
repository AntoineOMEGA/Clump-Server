const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  eventTemplateID: {
    type: String,
  },

  dayOfWeek: {
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

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
