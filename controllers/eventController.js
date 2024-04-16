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

    recurrence: req.body.recurrence,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  };

  if (req.body.until) {
    eventToCreate.until = req.body.until;
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
  let schedule = await Schedule.findById(req.body.scheduleID);

  let updatedEvent = {
    clumpID: req.cookies.currentClumpID,
    scheduleID: schedule._id,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    recurrence: req.body.recurrence,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  };

  if (req.body.until) {
    updatedEvent.until = req.body.until;
  }

  if (req.body.eventTemplateID) {
    updatedEvent.eventTemplateID = req.body.eventTemplateID;
  }

  if (req.body.shiftID) {
    updatedEvent.shiftID = req.body.shiftID;
  }

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    updatedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

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

exports.deleteEvent = catchAsync(async (req, res, next) => {
  let deletedEvent = {
    status: 'Deleted',
  };

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    deletedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
