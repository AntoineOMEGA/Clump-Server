const EventAttendantException = require('../models/eventAttendantExceptionModel');

const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getEventAttendantExceptions = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(EventAttendantException.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  const eventAttendantExceptions = await features.query;

  res.status(200).json({
    status: 'success',
    results: eventAttendantExceptions.length,
    data: {
      eventAttendantExceptions,
    },
  });
});

exports.getEventAttendantException = catchAsync(async (req, res, next) => {
  const eventAttendantException = await EventAttendantException.findById(req.params.id);

  if (!eventAttendantException) {
    return next(new AppError('No eventAttendantException found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventAttendantException,
    },
  });
});

exports.createEventAttendantException = catchAsync(async (req, res, next) => {
  let schedule = await Schedule.findById(req.body.scheduleID);

  let eventAttendantExceptionToCreate = {
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
    eventAttendantExceptionToCreate.until = req.body.until;
  }

  if (req.body.eventAttendantExceptionTemplateID) {
    eventAttendantExceptionToCreate.eventAttendantExceptionTemplateID = req.body.eventAttendantExceptionTemplateID;
  }

  let newEventAttendantException = await EventAttendantException.create(eventAttendantExceptionToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      newEventAttendantException,
    },
  });
});

exports.updateEventAttendantException = catchAsync(async (req, res, next) => {
  let schedule = await Schedule.findById(req.body.scheduleID);

  let updatedEventAttendantException = {
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
    updatedEventAttendantException.until = req.body.until;
  }

  if (req.body.eventAttendantExceptionTemplateID) {
    updatedEventAttendantException.eventAttendantExceptionTemplateID = req.body.eventAttendantExceptionTemplateID;
  }

  const eventAttendantException = await EventAttendantException.findByIdAndUpdate(
    req.params.id,
    updatedEventAttendantException,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventAttendantException) {
    return next(new AppError('No eventAttendantException found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventAttendantException,
    },
  });
});

exports.deleteEventAttendantException = catchAsync(async (req, res, next) => {
  let deletedEventAttendantException = {
    status: 'Deleted',
  };

  const eventAttendantException = await EventAttendantException.findByIdAndUpdate(
    req.params.id,
    deletedEventAttendantException,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventAttendantException) {
    return next(new AppError('No eventAttendantException found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
