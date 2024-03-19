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
    required: true,
  },
  location: {
    type: String,
    required: true,
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
    unique: true
  }

});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
