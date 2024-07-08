const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  scheduleID: {
    type: String,
    required: true,
  },
  parentEventID: {
    type: String
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
