const mongoose = require('mongoose');

const eventExceptionSchema = new mongoose.Schema({
  eventID: {
    type: String,
    required: true,
  },

  startDateTime: {
    type: Date,
    required: true
  },

});

const EventException = mongoose.model('eventException', eventExceptionSchema);

module.exports = EventException;
