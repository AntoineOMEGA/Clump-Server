const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const eventExceptionSchema = new Schema({
  scheduleID: {
    type: ObjectId,
    required: true,
  },

  eventID: {
    type: ObjectId,
  },
  eventAttendeeID: {
    type: ObjectId,
  },

  startDateTime: {
    type: Date,
    required: true
  },

});

const EventException = mongoose.model('eventException', eventExceptionSchema);

module.exports = EventException;
