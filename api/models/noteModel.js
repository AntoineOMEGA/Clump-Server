const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  tagIDs: {
    type: Array
  },
});

const Note = mongoose.model('note', noteSchema);

module.exports = Note;
