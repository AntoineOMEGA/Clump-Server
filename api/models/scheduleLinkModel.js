const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const scheduleLinkSchema = new Schema({
  scheduleID: {
    type: ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  }
});

const ScheduleLink = mongoose.model('ScheduleLink', scheduleLinkSchema);

module.exports = ScheduleLink;
