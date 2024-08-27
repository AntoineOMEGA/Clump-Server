const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const eventSchema = new Schema({
  scheduleID: {
    type: ObjectId,
    required: true,
  },
  parentEventID: {
    type: ObjectId
  },

  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
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

  recurrenceRuleID: {
    type: ObjectId
  }
});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
