const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  scheduleID: {
    type: String,
    required: true,
  },
  eventTemplateID: {
    type: String,
  },
  shiftID: {
    type: String,
  },
  
  creator: {
    type: String,
    required: true
  },

  organizer: {
    type: String,
  },
  attendees: {
    type: Array,
  },

  status: {
    type: String,
    required: true,
    default: 'Confirmed',
  },

  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },

  recurrence: {
    type: String,
  },
  cancelledDates: {
    type: Array,
  },
  
  created: {
    type: Date,
    required: true,
    default: new Date()
  },
  lastModified: {
    type: Date,
    required: true,
    default: new Date()
  },

  timeStamp: {
    type: Date,
    required: true,
    default: new Date()
  },
  sequence: {
    type: Number,
    required: true,
    default: 0
  }

});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
