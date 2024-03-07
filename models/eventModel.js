const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  clumpID: {
    type: String,
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
    type: Date
  },
  endDate: {
    type: Date
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  eventTemplateID: {
    type: String
  },
  scheduleID: {
    type: String
  },
  googleEventID: {
    type: String,
    unique: true
  }

});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
