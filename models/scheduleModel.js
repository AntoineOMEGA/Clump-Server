const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  scheduleCategoryID: {
    type: String,
    required: true,
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
  },
  timeZone: {
    type: String,
    required: true
  },
  
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  comments: {
    type: String
  }
});

const Schedule = mongoose.model('schedule', scheduleSchema);

module.exports = Schedule;
