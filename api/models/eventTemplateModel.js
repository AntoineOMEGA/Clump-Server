const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const eventTemplateSchema = new Schema({
  clumpID: {
    type: ObjectId,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  }
});

const EventTemplate = mongoose.model('eventTemplate', eventTemplateSchema);

module.exports = EventTemplate;
