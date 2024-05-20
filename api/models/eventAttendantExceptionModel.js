const mongoose = require('mongoose');

const eventAttendantExceptionSchema = new mongoose.Schema({
  scheduleID: {
    type: String,
    required: true,
  },
  eventAttendantID: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
    default: 'Confirmed',
  },

  startDateTime: {
    type: Date,
  },
  endDateTime: {
    type: Date,
  },

});

const EventAttendantException = mongoose.model('eventAttendantException', eventAttendantExceptionSchema);

module.exports = EventAttendantException;
