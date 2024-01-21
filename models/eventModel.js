const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
  dressCode: {
    type: String,
  },
  contact: {
    type: String,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  details: {
    type: String,
  },
  assignmentID: {
    type: String,
  },
  googleEventID: {
    type: String,
  },
  recurringEventID: {
    type: String,
  },
  missionaryID: {
    type: String,
    required: true
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
