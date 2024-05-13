const mongoose = require('mongoose');

const eventTemplateTagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  clumpID: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  }
});

const EventTemplateTag = mongoose.model('eventTemplateTag', eventTemplateTagSchema);

module.exports = EventTemplateTag;
