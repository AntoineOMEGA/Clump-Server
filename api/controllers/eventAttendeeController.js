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
    //occurrences: req.body.occurrences,
  };

  await EventAttendee.create(eventAttendeeToCreate);

  res.status(201).json({
    status: 'success'
  });
});

exports.updateEventAttendee = catchAsync(async (req, res, next) => {
  let currentEventAttendee = await EventAttendee.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEventAttendee.modifiedDateTime)) {
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
    occurrences: req.body.occurrences,

    modifiedDateTime: new Date(),
  };

  const eventAttendee = await EventAttendee.findByIdAndUpdate(
    req.params.id,
    updatedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventAttendee) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success'
  });
});

exports.updateThisEventAttendee = catchAsync(async (req, res, next) => {
  let currentEventAttendee = await EventAttendee.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEventAttendee.modifiedDateTime)) {
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
    eventAttendeeID: req.params.id,
    startDateTime: req.body.startDateTime
  }
  await EventException.create(eventExceptionToCreate);

  let eventAttendeeToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.body.eventID,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
    untilDateTime: new Date(req.body.untilDateTime),
    occurrences: req.body.occurrences,
  }

  await EventAttendee.create(eventAttendeeToCreate);

  res.status(201).json({
    status: 'success'
  });
});

exports.updateThisAndFollowingEventAttendees = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  let currentEventAttendee = await EventAttendee.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEventAttendee.modifiedDateTime)) {
    return next(new AppError('Failed. This update has been modified and you must refresh before updating it again.', 404));
  }

  currentEventAttendee.untilDateTime = untilDate;

  const updatedCurrentEventAttendee = await EventAttendee.findByIdAndUpdate(
    req.params.id,
    currentEventAttendee,
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

  let eventAttendeeToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.body.eventID,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
    untilDateTime: new Date(req.body.untilDateTime),
    occurrences: req.body.occurrences,
  }
  let newEventAttendee = await EventAttendee.create(eventAttendeeToCreate);

  let eventExceptions;

  if (new Date(currentEventAttendee.startDateTime).getDay() != new Date(eventAttendeeToCreate.startDateTime).getDay()) {
    eventExceptions = await EventException.deleteMany({eventAttendeeID: {$eq: req.params.id}});
  } else {
    eventExceptions = await EventException.updateMany(
      {$and: [{eventAttendeeID:{$eq: req.params.id}}, {startDateTime: {$gte: req.body.startDateTime}}]},  
      {eventAttendeeID: newEventAttendee._id}, function (err, eventExceptions) { 
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
  let currentEventAttendee = await EventAttendee.findById(req.params.id);
  if (new Date(req.body.modifiedDateTime) < new Date(currentEventAttendee.modifiedDateTime)) {
    return next(new AppError('Failed. This update has been modified and you must refresh before updating it again.', 404));
  }

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let updatedEventAttendee = {
    scheduleID: req.body.scheduleID,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
    untilDateTime: new Date(req.body.untilDateTime),
    occurrences: req.body.occurrences,
  };

  const eventAttendee = await EventAttendee.findByIdAndUpdate(
    req.params.id,
    updatedEventAttendee,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventAttendee) {
    return next(new AppError('No event attendee found with that ID', 404));
  }

  if (new Date(currentEventAttendee.startDateTime).getDay() != new Date(eventAttendee.startDateTime).getDay()) {
    const eventExceptions = await EventException.deleteMany({eventAttendeeID: {$eq: req.params.id}});
  }

  res.status(200).json({
    status: 'success'
  });
});

exports.deleteEventAttendee = catchAsync(async (req, res, next) => {
  const eventAttendee = await EventAttendee.findByIdAndDelete(req.params.id);

  if (!eventAttendee) {
    return next(new AppError('No event attendee found with that ID', 404));
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

  const currentEventAttendee = await EventAttendee.findById(req.params.id);

  currentEventAttendee.untilDateTime = untilDate;

  const eventAttendee = await EventAttendee.findByIdAndUpdate(
    req.params.id,
    currentEventAttendee,
    {
      new: true,
      runValidators: true,
    }
  );

  let eventExceptions = await EventException.deleteMany({$and: [{eventAttendeeID: {$eq: req.params.id}}, {startDateTime: {$gte: req.body.startDateTime}}]});

  if (!eventAttendee) {
    return next(new AppError('No event attendee found with that ID', 404));
  }

  res.status(200).json({
    status: 'success'
  });
});

exports.deleteAllEventAttendees = catchAsync(async (req, res, next) => {
  const eventAttendee = await EventAttendee.deleteOne({_id: req.params.id});
  const eventExceptions = await EventException.deleteMany({eventAttendeeID: {$eq: req.params.id}});

  if (!eventAttendee) {
    return next(new AppError('No event attendee found with that ID', 404));
  }

  res.status(204).send();
});