const Event = require('../models/eventModel');
const Clump = require('../models/clumpModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const { google } = require('googleapis');

const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(process.env.OAUTH_ID, process.env.OAUTH_SECRET);

exports.getEvents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  const events = await features.query;

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const refreshToken = await Clump.findById(req.cookies.currentClumpID);
  oAuth2Client.setCredentials({
    refresh_token: refreshToken.googleToken,
  });

  const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  let schedule = await Schedule.findById(req.body.scheduleID);

  var event = {
    summary: req.body.title,
    location: req.body.location,
    description: req.body.description,
    start: {
      dateTime: new Date(req.body.startDateTime),
      timeZone: 'America/Denver',
    },
    end: {
      dateTime: new Date(req.body.endDateTime),
      timeZone: 'America/Denver',
    },
  };

  if (req.body.frequency === 'Weekly') {
    event.recurrence = [
      'RRULE:FREQ=WEEKLY;UNTIL=' + schedule.endDate.toISOString().replace('-', '').replace('-', '').replace(':', '').replace(':', '').substring(0, 15) + 'Z'
    ]
  }

  const tempevent = {
    'summary': 'Google I/O 2024',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2024-05-28T09:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'end': {
      'dateTime': '2024-05-28T17:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
      { 'email': 'lpage@example.com' },
      { 'email': 'sbrin@example.com' },
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        { 'method': 'email', 'minutes': 24 * 60 },
        { 'method': 'popup', 'minutes': 10 },
      ],
    },
  };

  let gEvent;
  try {
    gEvent = await gCalendar.events.insert({
      auth: oAuth2Client,
      calendarId: schedule.googleCalendarID,
      resource: event,
    });
  } catch (error) {
    return next(new AppError('Event creation failed', 400));
  }

  if (gEvent.recurrence) {
    await gCalendar.events.instances();

  }

  let lNewEvent = {
    title: gEvent.data.summary,
    googleEventID: gEvent.data.id,
    description: gEvent.data.description,
    location: gEvent.data.location,
    startDateTime: new Date(gEvent.data.start.dateTime),
    endDateTime: new Date(gEvent.data.end.dateTime),
    scheduleID: schedule._id,
    clumpID: req.cookies.currentClumpID,
    created: gEvent.data.created,
    updated: gEvent.data.updated
  };

  let localNewEvent = await Event.create(lNewEvent);

  res.status(201).json({
    status: 'success',
    data: {
      event: localNewEvent,
    },
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  //Needs Google Integration
  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  //Needs Google Integration
  res.status(204).json({
    status: 'success',
  });
});
