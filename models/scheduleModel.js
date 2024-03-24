const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  timeZone: {
    type: String
  },
  scheduleCategoryID: {
    type: String,
    required: true,
  },
  clumpID: {
    type: String,
    required: true,
  },
  googleCalendarID: {
    type: String,
    unique: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  nextSyncToken: {
    type: String,
  },
  comments: {
    type: String
  }
});

const Schedule = mongoose.model('schedule', scheduleSchema);

module.exports = Schedule;
