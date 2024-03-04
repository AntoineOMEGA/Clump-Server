const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    unique: true,
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
});

const Schedule = mongoose.model('schedule', scheduleSchema);

module.exports = Schedule;
