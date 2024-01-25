const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  clumpID: {
    type: String,
  },
  title: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
