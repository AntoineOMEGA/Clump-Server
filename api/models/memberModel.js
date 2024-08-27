const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const memberSchema = new Schema({
  clumpID: {
    type: ObjectId,
    required: true,
  },
  userID: {
    type: ObjectId,
    required: true,
  },
  roleID: {
    type: ObjectId,
    required: true,
  }
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;