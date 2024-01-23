const Missionary = require('../models/missionaryModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { google } = require('googleapis');

const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(process.env.OAUTH_ID, process.env.OAUTH_SECRET);

oAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});

const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });
/*
//Alias route for regularly used queries
exports.aliasMissionaryCalendars = (req, res, next) => {
  req.query.limit = '1';
  req.query.type = 'person';
  next();
};
*/

exports.getMissionaries = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Missionary.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const missionaries = await features.query;

  res.status(200).json({
    status: 'success',
    results: missionaries.length,
    data: {
      missionaries: missionaries,
    },
  });
});

exports.getMissionary = catchAsync(async (req, res, next) => {
  const missionary = await Missionary.findById(req.params.id);

  if (!missionary) {
    return next(new AppError('No missionary found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      missionary,
    },
  });
});

exports.createMissionary = catchAsync(async (req, res, next) => {
  const newMissionary = await Missionary.create({
    name: req.body.name,
    googleID: 'undefined',
  });

  //Probably need to share the calendar here too
  const newGoogleCalendar = await gCalendar.calendars.insert({
    requestBody: { summary: req.body.name },
  });

  newMissionary.googleCalendarID = newGoogleCalendar.data.id;
  await newMissionary.save();

  res.status(201).json({
    status: 'success',
    data: {
      missionary: newMissionary,
    },
  });
});

exports.updateMissionary = catchAsync(async (req, res, next) => {
  //NEED TO UPDATE SUMMARY OF GOOGLE CALENDAR

  const missionary = await Missionary.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!missionary) {
    return next(new AppError('No missionary found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    //You can include a results: var
    data: {
      missionary,
    },
  });
});

exports.deleteMissionary = catchAsync(async (req, res, next) => {
  // DELETE GOOGLE CALENDAR

  const missionary = await Missionary.findByIdAndDelete(req.params.id);

  if (!missionary) {
    return next(new AppError('No missionary found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});

//COME BACK TO DO EXTRA STAT OPPERATIONS USING AGGREGATION Video 102 and 103
