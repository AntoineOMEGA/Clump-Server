const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recurrenceRuleSchema = new Schema({
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly by day', 'Monthly by date', 'Yearly by day', 'Yearly by date'],
    required: true
  },

  //Used with Weekly, Monthly by day, Yearly by day
  byDay: {
    type: String,
    enum: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  },

  //Used with Monthly by day, Yearly by day
  byWeekInMonth: {
    type: Number,
    enum: [-1, 1, 2, 3, 4, 5]
  },

  //Used with Monthly by date, Yearly by date
  byMonthDay: {
    type: Number,
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

const RecurrenceRule = mongoose.model('recurrenceRule', recurrenceRuleSchema);

module.exports = RecurrenceRule;
