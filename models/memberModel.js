const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  roleID: {
    type: String,
    required: true,
  }
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;