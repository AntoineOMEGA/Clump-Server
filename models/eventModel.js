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

  creatorID: {
    type: String,
    required: true
  },

  organizerID: {
    type: String,
  },
  attendeeIDs: {
    type: Array,
  },

  status: {
    type: String,
    required: true,
    default: 'Confirmed',
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
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },

  recurrence: {
    type: Object
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
  },

  recurrence: {
    type: Object
  }

});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
