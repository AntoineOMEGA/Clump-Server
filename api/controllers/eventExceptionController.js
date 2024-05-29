const EventException = require('../models/eventExceptionModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getEventExceptions = catchAsync(async (req, res, next) => {
  const eventExceptions = await Event.find({scheduleID: req.body.currentscheduleID});

  res.status(200).json({
    status: 'success',
    results: eventExceptions.length,
    data: {
      eventExceptions,
    },
  });
});

exports.getEventException = catchAsync(async (req, res, next) => {
  const eventException = await EventException.findById(req.params.id);

  if (!eventException) {
    return next(new AppError('No eventException found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventException,
    },
  });
});

exports.createEventException = catchAsync(async (req, res, next) => {
  let eventExceptionToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.body.eventID,

    eventOccurrence: new Date(req.body.eventOccurrence),
    status: req.body.status,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  };

  let newEventException = await EventException.create(eventExceptionToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      newEventException,
    },
  });
});

exports.updateEventException = catchAsync(async (req, res, next) => {
  let updatedEventException = {
    scheduleID: req.body.scheduleID,
    eventID: req.body.eventID,

    eventOccurrence: new Date(req.body.eventOccurrence),
    status: req.body.status,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  };

  const eventException = await EventException.findByIdAndUpdate(
    req.params.id,
    updatedEventException,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventException) {
    return next(new AppError('No eventException found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventException,
    },
  });
});

exports.deleteEventException = catchAsync(async (req, res, next) => {
  const eventException = await EventException.findByIdAndDelete(req.params.id);

  if (!eventException) {
    return next(new AppError('No eventException found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
