const mongoose = require('mongoose');

const scheduleCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  color: {
    type: String,
    require: true,
  },
  clumpID: {
    type: String,
    require: true,
  }
});

const ScheduleCategory = mongoose.model('scheduleCategory', scheduleCategorySchema);

module.exports = ScheduleCategory;
