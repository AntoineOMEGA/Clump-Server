const Calendar = require('./../models/calendarModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const { google } = require('googleapis');

const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
  process.env.OAUTH_ID,
  process.env.OAUTH_SECRET
);

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

exports.getCalendars = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Calendar.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const calendars = await features.query;

  res.status(200).json({
    status: 'success',
    results: calendars.length,
    data: {
      calendars: calendars,
    },
  });
});

exports.getCalendar = catchAsync(async (req, res, next) => {
  const calendar = await Calendar.findById(req.params.id);

  if (!calendar) {
    return next(new AppError('No calendar found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      calendar,
    },
  });
});

exports.createCalendar = catchAsync(async (req, res, next) => {
  const newCalendar = await Calendar.create({
    name: req.body.name,
    googleID: 'undefined',
  });
  
  //Probably need to share the calendar here too
  const newGoogleCalendar = await gCalendar.calendars.insert({
    requestBody: { summary: req.body.name },
  });

  newCalendar.googleID = newGoogleCalendar.data.id;
  await newCalendar.save();
  
  res.status(201).json({
    status: 'success',
    data: {
      calendar: newCalendar,
    },
  });
});

exports.updateCalendar = catchAsync(async (req, res, next) => {
  //NEED TO UPDATE SUMMARY OF GOOGLE CALENDAR

  const calendar = await Calendar.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!calendar) {
    return next(new AppError('No calendar found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    //You can include a results: var
    data: {
      calendar,
    },
  });
});

exports.deleteCalendar = catchAsync(async (req, res, next) => {
  // DELETE GOOGLE CALENDAR

  const calendar = await Calendar.findByIdAndDelete(req.params.id);

  if (!calendar) {
    return next(new AppError('No calendar found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});

//COME BACK TO DO EXTRA STAT OPPERATIONS USING AGGREGATION Video 102 and 103
