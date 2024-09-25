const EventAttendee = require('../models/eventAttendeeModel');
const Event = require('../models/eventModel');
const EventException = require('../models/eventExceptionModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createEventAttendee = catchAsync(async (req, res, next) => {
  //TODO: Other Validation Related to Main Event
  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let eventAttendeeToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.body.eventID,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
    untilDateTime: new Date(req.body.untilDateTime),
  };

  let newEvent = await Event.create(eventAttendeeToCreate);

  res.status(201).json({
    status: 'success'
  });
});

exports.updateEventAttendee = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEvent.modifiedDateTime)) {
    return next(new AppError('Failed. This update has been modified and you must refresh before updating it again.', 404));
  }

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date.', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date.', 404));
  }

  let updatedEventAttendee = {
    scheduleID: req.body.scheduleID,
    eventID: req.body.eventID,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
    untilDateTime: new Date(req.body.untilDateTime),

    modifiedDateTime: new Date(),
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

  res.status(200).json({
    status: 'success'
  });
});

exports.updateThisEventAttendee = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEvent.modifiedDateTime)) {
    return next(new AppError('Failed. This update has been modified and you must refresh before updating it again.', 404));
  }

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let eventExceptionToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.params.id,
    startDateTime: req.body.startDateTime
  }
  let newEventException = await EventException.create(eventExceptionToCreate);

  let eventToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.body.eventID,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
    untilDateTime: new Date(req.body.untilDateTime),
  }
  let newEvent = await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success'
  });
});

exports.updateThisAndFollowingEventAttendees = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  let currentEvent = await Event.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEvent.modifiedDateTime)) {
    return next(new AppError('Failed. This update has been modified and you must refresh before updating it again.', 404));
  }

  currentEvent.recurrenceRule.untilDateTime = untilDate;

  const updatedCurrentEvent = await Event.findByIdAndUpdate(
    req.params.id,
    currentEvent,
    {
      new: true,
      runValidators: true,
    });
  
  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }
  
  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let eventToCreate = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    timeZone: req.body.timeZone,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,
  }
  let newEvent = await Event.create(eventToCreate);

  let eventExceptions;

  if (new Date(currentEvent.startDateTime).getDay() != new Date(eventToCreate.startDateTime).getDay()) {
    eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});
  } else {
    eventExceptions = await EventException.updateMany(
      {$and: [{eventID:{$eq: req.params.id}}, {startDateTime: {$gte: req.body.startDateTime}}]},  
      {eventID: newEvent._id}, function (err, eventExceptions) { 
      if (err){ 
        return next(new AppError('Issue updating Event Exceptions', 400));
      }
    });
  }

  res.status(201).json({
    status: 'success'
  });
});

exports.updateAllEventAttendees = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEvent.modifiedDateTime)) {
    return next(new AppError('Failed. This update has been modified and you must refresh before updating it again.', 404));
  }

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let updatedEvent = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    frequency: req.body.frequency,
    interval: req.body.interval,
    untilDateTime: req.body.untilDateTime,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,
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
    status: 'success'
  });
});

exports.deleteEventAttendee = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});

exports.deleteThisEventAttendee = catchAsync(async (req, res, next) => {
  let eventExceptionToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.params.id,
    startDateTime: req.body.startDateTime
  }
  let eventException = await EventException.create(eventExceptionToCreate);

  res.status(201).json({
    status: 'success'
  });
});

exports.deleteThisAndFollowingEventAttendees = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  const currentEvent = await Event.findById(req.params.id);

  currentEvent.recurrenceRule.untilDateTime = untilDate;

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    currentEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  let eventExceptions = await EventException.deleteMany({$and: [{eventID: {$eq: req.params.id}}, {startDateTime: {$gte: req.body.startDateTime}}]});

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success'
  });
});

exports.deleteAllEventAttendees = catchAsync(async (req, res, next) => {
  const event = await Event.deleteOne({_id: req.params.id});
  const eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});