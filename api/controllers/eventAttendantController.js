const EventAttendant = require('../models/eventAttendantModel');

const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getEventAttendants = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(EventAttendant.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  const eventAttendants = await features.query;

  res.status(200).json({
    status: 'success',
    results: eventAttendants.length,
    data: {
      eventAttendants,
    },
  });
});

exports.getEventAttendant = catchAsync(async (req, res, next) => {
  const eventAttendant = await EventAttendant.findById(req.params.id);

  if (!eventAttendant) {
    return next(new AppError('No eventAttendant found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventAttendant,
    },
  });
});

exports.createEventAttendant = catchAsync(async (req, res, next) => {
  let schedule = await Schedule.findById(req.body.scheduleID);

  let eventAttendantToCreate = {
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
    eventAttendantToCreate.until = req.body.until;
  }

  if (req.body.eventAttendantTemplateID) {
    eventAttendantToCreate.eventAttendantTemplateID = req.body.eventAttendantTemplateID;
  }

  let newEventAttendant = await EventAttendant.create(eventAttendantToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      newEventAttendant,
    },
  });
});

exports.updateEventAttendant = catchAsync(async (req, res, next) => {
  let schedule = await Schedule.findById(req.body.scheduleID);

  let updatedEventAttendant = {
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
    updatedEventAttendant.until = req.body.until;
  }

  if (req.body.eventAttendantTemplateID) {
    updatedEventAttendant.eventAttendantTemplateID = req.body.eventAttendantTemplateID;
  }

  const eventAttendant = await EventAttendant.findByIdAndUpdate(
    req.params.id,
    updatedEventAttendant,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventAttendant) {
    return next(new AppError('No eventAttendant found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventAttendant,
    },
  });
});

exports.deleteEventAttendant = catchAsync(async (req, res, next) => {
  let deletedEventAttendant = {
    status: 'Deleted',
  };

  const eventAttendant = await EventAttendant.findByIdAndUpdate(
    req.params.id,
    deletedEventAttendant,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventAttendant) {
    return next(new AppError('No eventAttendant found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
