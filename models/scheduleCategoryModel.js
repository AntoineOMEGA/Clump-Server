const mongoose = require('mongoose');

const scheduleCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    unique: true,
  },
  subtitle: {
    type: String,
  },
  color: {
    type: String,
  },
});

const ScheduleCategory = mongoose.model('scheduleCategory', scheduleCategorySchema);

module.exports = ScheduleCategory;
