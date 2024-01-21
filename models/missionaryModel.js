const mongoose = require('mongoose');

const missionarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  googleCalendarID: {
    type: String,
  },
  districtID: {
    type: String,
    required: true,
  }
});

const Missionary = mongoose.model('Missionary', missionarySchema);

module.exports = Missionary;

//COME BACK TO DO VIRTUAL (TEMPORARY DATA THAT DOESN'T GET ADDED TO THE DB) Video 104

//DOCUMENT MIDDLEWARE Video 105

//QUERY MIDDLEWARE Video 106

//AGGREGATION MIDDLEWARE Video 107

//MAKE A CUSTOM VALIDATOR ||||||| Video 109 !!!
//USE VALIDATOR LIBRARY Video 109
