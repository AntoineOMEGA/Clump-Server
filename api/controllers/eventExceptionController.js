const EventException = require('../models/eventExceptionModel');

const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getEventExceptions = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(EventException.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  const eventExceptions = await features.query;

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
  let schedule = await Schedule.findById(req.body.scheduleID);

  let eventExceptionToCreate = {
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
    eventExceptionToCreate.until = req.body.until;
  }

  if (req.body.eventExceptionTemplateID) {
    eventExceptionToCreate.eventExceptionTemplateID = req.body.eventExceptionTemplateID;
  }

  let newEventException = await EventException.create(eventExceptionToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      newEventException,
    },
  });
});

exports.updateEventException = catchAsync(async (req, res, next) => {
  let schedule = await Schedule.findById(req.body.scheduleID);

  let updatedEventException = {
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
    updatedEventException.until = req.body.until;
  }

  if (req.body.eventExceptionTemplateID) {
    updatedEventException.eventExceptionTemplateID = req.body.eventExceptionTemplateID;
  }

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
  let deletedEventException = {
    status: 'Deleted',
  };

  const eventException = await EventException.findByIdAndUpdate(
    req.params.id,
    deletedEventException,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventException) {
    return next(new AppError('No eventException found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
