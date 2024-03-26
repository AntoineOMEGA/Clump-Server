const mongoose = require('mongoose');

const recurringEventSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  scheduleID: {
    type: String,
    required: true,
  },
  googleRecurringEventID: {
    type: String,
    unique: true
  },
  recurrence: {
    type: String,
  },

});

const RecurringEvent = mongoose.model('recurringEvent', recurringEventSchema);

module.exports = RecurringEvent;
