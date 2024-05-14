const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
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

const Tag = mongoose.model('tag', tagSchema);

module.exports = Tag;
