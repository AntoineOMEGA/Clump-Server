const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const noteSchema = new Schema({
  clumpID: {
    type: ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  note: {
    type: String,
    required: true,
    trim: true,
  },
  tagIDs: {
    type: [ObjectId]
  },
});

const Note = mongoose.model('note', noteSchema);

module.exports = Note;
