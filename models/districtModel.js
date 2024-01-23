const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
  area: {
    type: String,
  },
  color: {
    type: String,
  },
});

const District = mongoose.model('District', districtSchema);

module.exports = District;
