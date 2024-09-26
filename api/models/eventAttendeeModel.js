const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const eventAttendeeSchema = new Schema({
  scheduleID: {
    type: ObjectId,
    required: true,
  },
  eventID: {
    type: ObjectId,
    required: true,
  },

  startDateTime: {
    type: Date,
  },
  endDateTime: {
    type: Date,
  },
  recurrenceRule: {
    type: ObjectId
  },

  createdDateTime: {
    type: Date,
    required: true,
    default: new Date()
  },
  modifiedDateTime: {
    type: Date,
    required: true,
    default: new Date()
  },
});

const EventAttendee = mongoose.model('eventAttendee', eventAttendeeSchema);

module.exports = EventAttendee;
