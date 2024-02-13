const mongoose = require('mongoose');

const googleSchema = new mongoose.Schema({
  clumpID: {
    type: String,
    required: true,
  },
  memberID: {
    type: String,
    required: true,
  },
  googleCode: {
    type: String,
    required: true,
    unique: true
  },
  scope: {
    type: String,
    required: true,
    unique: true
  },
});

const Google = mongoose.model('Google', googleSchema);

module.exports = Google;
