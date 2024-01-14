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

exports.getEvents = catchAsync(async (req, res, next) => {
  

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {


  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  
  
  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent,
    },
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {


  res.status(200).json({
    status: 'success',
    //You can include a results: var
    data: {
      event,
    },
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {


  res.status(204).json({
    status: 'success',
  });
});