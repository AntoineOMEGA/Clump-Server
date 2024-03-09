const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    require: true,
  },
  startDateTime: {
    type: Date,
    require: true,
  },
  endDateTime: {
    type: Date,
    require: true,
  },
  eventTemplateID: {
    type: String
  },
  scheduleID: {
    type: String,
    require: true,
  },
  googleEventID: {
    type: String,
    unique: true
  }

});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
