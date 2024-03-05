const mongoose = require('mongoose');

const scheduleCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  color: {
    type: String,
  },
  clumpID: {
    type: String,
  }
});

const ScheduleCategory = mongoose.model('scheduleCategory', scheduleCategorySchema);

module.exports = ScheduleCategory;
