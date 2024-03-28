const mongoose = require('mongoose');

const eventTemplateSchema = new mongoose.Schema({
  clumpID: {
    type: String,
  },

  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },

  comments: {
    type: String
  },
});

const EventTemplate = mongoose.model('eventTemplate', eventTemplateSchema);

module.exports = EventTemplate;
