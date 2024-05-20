const mongoose = require('mongoose');

const eventExceptionSchema = new mongoose.Schema({
  scheduleID: {
    type: String,
    required: true,
  },
  eventID: {
    type: String,
    required: true,
  },

  //Date of Occurrence
  eventOccurrence: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true
  },

  startDateTime: {
    type: Date,
  },
  endDateTime: {
    type: Date,
  },

});

const EventException = mongoose.model('eventException', eventExceptionSchema);

module.exports = EventException;
