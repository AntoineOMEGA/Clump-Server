const EventTemplate = require('../models/eventTemplateModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getEventTemplates = catchAsync(async (req, res, next) => {
  const eventTemplates = await EventTemplate.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: eventTemplates.length,
    data: {
      eventTemplates: eventTemplates,
    },
  });
});

exports.getEventTemplate = catchAsync(async (req, res, next) => {
  const eventTemplate = await EventTemplate.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!eventTemplate) {
    return next(new AppError('No eventTemplate found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplate,
    },
  });
});

exports.createEventTemplate = catchAsync(async (req, res, next) => {
  let newEventTemplate = await EventTemplate.create({
    clumpID: req.cookies.currentClumpID,
    title: req.body.title,
    description: req.body.description,
    location: req.body.location
  });
  

  res.status(201).json({
    status: 'success',
    data: {
      eventTemplate: newEventTemplate,
    },
  });
});

exports.updateEventTemplate = catchAsync(async (req, res, next) => {
  let updatedEventTemplate = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location
  };

  const eventTemplate = await EventTemplate.findByIdAndUpdate(
    req.params.id,
    updatedEventTemplate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventTemplate) {
    return next(new AppError('No eventTemplate found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplate,
    },
  });
});

exports.deleteEventTemplate = catchAsync(async (req, res, next) => {
  const eventTemplate = await EventTemplate.findByIdAndDelete(req.params.id);

  if (!eventTemplate) {
    return next(new AppError('No eventTemplate found with that ID', 404));
  }

  res.status(204).send();
});
