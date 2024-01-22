const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
});

const Area = mongoose.model('Area', areaSchema);

module.exports = Area;
