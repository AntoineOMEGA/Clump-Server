const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const tagSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
  },
  clumpID: {
    type: ObjectId,
    required: true,
  },
  type: {
    type: String,
    //TODO: Add ENUM
  }
});

const Tag = mongoose.model('tag', tagSchema);

module.exports = Tag;
