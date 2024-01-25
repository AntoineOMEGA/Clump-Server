const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  clumpID: {
    type: String,
  },
  userID: {
    type: String,
  },
  role: {
    type: String,
  }
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;