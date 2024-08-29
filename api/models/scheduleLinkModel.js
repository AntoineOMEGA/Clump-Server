const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const validator = require('validator');

const scheduleLinkSchema = new Schema({
  scheduleID: {
    type: ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  recipient: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail],
  }
});

const ScheduleLink = mongoose.model('ScheduleLink', scheduleLinkSchema);

module.exports = ScheduleLink;
