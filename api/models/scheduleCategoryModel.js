const mongoose = require('mongoose');

const scheduleCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  color: {
    type: String,
    required: true,
  },
  clumpID: {
    type: String,
    required: true,
  }
});

const ScheduleCategory = mongoose.model('scheduleCategory', scheduleCategorySchema);

module.exports = ScheduleCategory;
