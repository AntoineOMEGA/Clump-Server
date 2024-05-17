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
  timeZone: {
    type: String,
  },
  startDateTime: {
    type: Date,
  },
  endDateTime: {
    type: Date,
  },

  recurrence: {
    type: Object,
  },

  until: {
    type: Date
  },

  cancelledDates: {
    type: Array,
  },

});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
