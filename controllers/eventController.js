const Event = require('../models/eventModel');
const Clump = require('../models/clumpModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

  res.status(201).json({
    status: 'success',
    data: {
      event,
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
