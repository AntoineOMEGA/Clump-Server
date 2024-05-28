const mongoose = require('mongoose');

const eventAttendantSchema = new mongoose.Schema({
  scheduleID: {
    type: String,
    required: true,
  },
  eventID: {
    type: String,
    required: true,
  },

  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
});

const EventAttendant = mongoose.model('eventAttendant', eventAttendantSchema);

module.exports = EventAttendant;
