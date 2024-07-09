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
  let eventExceptionToCreate = {
    eventID: req.body.eventID,
    startDateTime: req.body.startDateTime
  }
  EventException.create(eventExceptionToCreate);

  let eventToCreate = {

  }
  Event.create(eventToCreate);

  //TODO: Get AND Update Child Events if they have their own Start OR End DateTimes
});

exports.updateThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let event = await Event.findById(req.body.eventID);
  //TODO: Update Event to End before NEW Event

  let eventToCreate = {

  }
  Event.create(eventToCreate);

  EventException.updateMany();
  //TODO: Update Event Exceptions for Original Event to New Event if they occur During the New Event

  if (new Date(currentEvent.startDateTime).getDay() != new Date(event.startDateTime).getDay()) {
    const eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});
  }
});

exports.updateAllEvents = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);

  let updatedEvent = {
    recurrence: { until: req.body.recurrence.until},
  };

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

  if (new Date(currentEvent.startDateTime).getDay() != new Date(event.startDateTime).getDay()) {
    const eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});

exports.deleteThisEvent = catchAsync(async (req, res, next) => {
  let eventExceptionToCreate = {
    eventID: req.params.id,
    startDateTime: req.body.startDateTime
  }
  let eventException = await EventException.create(eventExceptionToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      eventException,
    },
  });
});

exports.deleteThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  let updatedEvent = {
    recurrence: { until: untilDate},
  };

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    updatedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  let eventExceptions = await EventException.deleteMany($and[{eventID: {$eq: req.params.id}}, {startDateTime: {$gte: req.body.startDateTime}}]);

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

exports.deleteAllEvents = catchAsync(async (req, res, next) => {
  const event = await Event.deleteOne({_id: req.params.id});
  const eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});