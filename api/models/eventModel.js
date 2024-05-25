const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true
  },
  scheduleID: {
    type: String,
    required: true,
  },

  title: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  timeZone: {
    type: String,
  },
  startDateTime: {
    type: Date,
  },
  endDateTime: {
    type: Date,
  },

  recurrence: {
    type: Object,
  },
});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
