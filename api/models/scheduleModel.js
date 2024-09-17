const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const scheduleSchema = new Schema({
  clumpID: {
    type: ObjectId,
    required: true,
  },
  tagIDs: {
    type: [ObjectId]
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    default: '#ffffff'
  },
  timeZone: {
    type: String,
    required: true
  },
  
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  }
});

const Schedule = mongoose.model('schedule', scheduleSchema);

module.exports = Schedule;
