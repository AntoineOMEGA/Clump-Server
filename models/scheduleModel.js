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
  },
  googleCalendarID: {
    type: String,
  },
  active: {
    type: Boolean,
    require: true,
    default: true,
  }
});

const Schedule = mongoose.model('schedule', scheduleSchema);

module.exports = Schedule;
