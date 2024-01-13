const Calendar = require('./../models/calendarModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const { google } = require('googleapis');

const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
  '933929627925-m6tpcp0pe9an96roko74618efkgrt1nn.apps.googleusercontent.com',
  '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'
);

oAuth2Client.setCredentials({
  refresh_token:
    '1//04BPmiCS6VomlCgYIARAAGAQSNwF-L9IrOXD5gQnB7O4qA404_iRWL7hTXuThhnwSwRWS53sMj2orCeWhBofsiQgN812p9og3A0Y',
});

const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });

//Alias route for regularly used queries
exports.aliasMissionaryCalendars = (req, res, next) => {
  req.query.limit = '1';
  req.query.type = 'person';
  next();
};

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
  //Probably need to share the calendar here too
  const newGoogleCalendar = await gCalendar.calendars.insert({
    requestBody: { summary: req.body.name },
  });

  const newGoogleCalendarId = await Calendar.create({
    name: req.body.name,
    type: req.body.type,
    googleID: newGoogleCalendar.data.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      calendar: newGoogleCalendarId,
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
