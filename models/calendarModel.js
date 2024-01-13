const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: ['missionary', 'site', 'district', 'zone'],
      message: 'Not a valid type!',
    },
  },
  googleID: {
    type: String,
    required: true,
    unique: true,
  },
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;

//COME BACK TO DO VIRTUAL (TEMPORARY DATA THAT DOESN'T GET ADDED TO THE DB) Video 104

//DOCUMENT MIDDLEWARE Video 105

//QUERY MIDDLEWARE Video 106

//AGGREGATION MIDDLEWARE Video 107

//MAKE A CUSTOM VALIDATOR ||||||| Video 109 !!!
//USE VALIDATOR LIBRARY Video 109
