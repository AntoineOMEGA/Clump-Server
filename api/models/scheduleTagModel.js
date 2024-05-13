const mongoose = require('mongoose');

const scheduleTagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  clumpID: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  }
});

const ScheduleTag = mongoose.model('scheduleTag', scheduleTagSchema);

module.exports = ScheduleTag;
