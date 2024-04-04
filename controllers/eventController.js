const Event = require('../models/eventModel');
const Clump = require('../models/clumpModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;

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

  let eventToCreate = {
    clumpID: req.cookies.currentClumpID,
    scheduleID: schedule._id,

    creatorID: req.cookies.currentUserID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,


    frequency: req.body.frequency,
    byDayWeekly: req.body.ByDayWeekly,
    byDayMonthly: req.body.ByDayMonthly,
    byDayExtended: req.body.ByDayExtended,
    interval: req.body.interval,
    count: req.body.count,
    until: req.body.until,


    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  }

  if (req.body.eventTemplateID) {
    eventToCreate.eventTemplateID = req.body.eventTemplateID;
  }

  if (req.body.shiftID) {
    eventToCreate.shiftID = req.body.shiftID;
  }

  let newEvent = await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      newEvent,
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
