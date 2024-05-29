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

  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },

});

const EventAttendantException = mongoose.model('eventAttendantException', eventAttendantExceptionSchema);

module.exports = EventAttendantException;
