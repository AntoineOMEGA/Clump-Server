const Event = require('../models/eventModel');
const EventException = require('../models/eventExceptionModel');
const Clump = require('../models/clumpModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;

exports.getEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({clumpID: req.cookies.currentClumpID});

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

//UPDATE SUB FUNCTIONS
exports.updateThisEvent = catchAsync(async (req, res, next) => {

});

exports.updateThisAndFollowingEvents = catchAsync(async (req, res, next) => {

});

exports.updateAllEvents = catchAsync(async (req, res, next) => {

});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});

//DELETE SUB FUNCTIONS
exports.deleteThisEvent = catchAsync(async (req, res, next) => {

});

exports.deleteThisAndFollowingEvents = catchAsync(async (req, res, next) => {

});

exports.deleteAllEvents = catchAsync(async (req, res, next) => {

});