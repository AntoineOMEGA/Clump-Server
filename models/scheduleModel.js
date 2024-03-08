const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    trim: true,
  },
  scheduleCategories: {
    type: Array
  },
  clumpID: {
    type: String,
    require: true,
  },
  googleCalendarID: {
    type: String,
    unique: true,
  },
  active: {
    type: Boolean,
    require: true,
    default: true,
  },
  startDate: {
    type: Date,
    require: true,
  },
  endDate: {
    type: Date,
    require: true,
  }
});

const Schedule = mongoose.model('schedule', scheduleSchema);

module.exports = Schedule;
