const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const recurrenceRuleSchema = new Schema({
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly by day', 'Monthly by date', 'Yearly by day', 'Yearly by date'],
  },

  //Used with Weekly
  byDay: {
    type: [String],
    enum: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  },

  //Used with Monthly by day, Yearly by day
  byWeekDayInMonth: {
    type: [String],
    enum: ['1SU', '2SU', '3SU', '4SU', '5SU', '-1SU', '1MO', '2MO', '3MO', '4MO', '5MO', '-1MO', '1TU', '2TU', '3TU', '4TU', '5TU', '-1TU', '1WE', '2WE', '3WE', '4WE', '5WE', '-1WE', '1TH', '2TH', '3TH', '4TH', '5TH', '-1TH', '1FR', '2FR', '3FR', '4FR', '5FR', '-1FR', '1SA', '2SA', '3SA', '4SA', '5SA', '-1SA']
  },

  //Used with Monthly by date, Yearly by date
  byMonthDay: {
    type: [Number],
    min: 1,
    max: 31
  },

  //Used with Yearly by day, Yearly by date
  byMonth: {
    type: Number,
    min: 1,
    max: 12
  },

  interval: {
    type: Number,
  },

  untilDateTime: {
    type: Date
  },
  occurrences: {
    type: Number
  }
});

const eventSchema = new Schema({
  scheduleID: {
    type: ObjectId,
    required: true,
  },

  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  timeZone: {
    type: String,
  },
  startDateTime: {
    type: Date,
  },
  endDateTime: {
    type: Date,
  },

  recurrenceRule: {
    type: Object
    //child: recurrenceRuleSchema
  },

  createdDateTime: {
    type: Date,
    required: true,
    default: new Date()
  },
  modifiedDateTime: {
    type: Date,
    required: true,
    default: new Date()
  },

  maxAttendees: {
    type: Number
  }
});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
