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
  start: {
    type: Object
  },
  end: {
    type: Object
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
