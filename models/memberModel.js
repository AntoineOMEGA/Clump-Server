const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    require: true,
  },
  userID: {
    type: String,
    require: true,
  },
  roleID: {
    type: String,
    require: true,
  }
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;