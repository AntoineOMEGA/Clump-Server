const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    trim: true,
  },
  scheduleCategoryID: {
    type: String,
    require: true,
    default: '',
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
  }
});

const Schedule = mongoose.model('schedule', scheduleSchema);

module.exports = Schedule;
