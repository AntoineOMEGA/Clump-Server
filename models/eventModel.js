const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
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
  eventTemplateID: {
    type: String
  },
  scheduleID: {
    type: String,
    required: true,
  },
  googleEventID: {
    type: String,
  },
  googleRecurringEventID: {
    type: String,
  },
  created: {
    type: Date,
  },
  updated: {
    type: Date,
  },
  attendees: {
    type: Array
  }

});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
