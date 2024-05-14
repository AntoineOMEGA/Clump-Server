const EventTemplateTag = require('../models/eventTemplateTagModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const EventTemplate = require('../models/eventTemplateModel');

exports.getEventTemplateTags = catchAsync(async (req, res, next) => {
  const eventTemplateTags = await EventTemplateTag.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: eventTemplateTags.length,
    data: {
      eventTemplateTags: eventTemplateTags,
    },
  });
});

exports.getEventTemplateTag = catchAsync(async (req, res, next) => {
  const eventTemplateTag = await EventTemplateTag.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!eventTemplateTag) {
    return next(new AppError('No eventTemplateTag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplateTag,
    },
  });
});

exports.createEventTemplateTag = catchAsync(async (req, res, next) => {
  let newEventTemplateTag;

  if (true) {
    newEventTemplateTag = await EventTemplateTag.create({
      clumpID: req.cookies.currentClumpID,
      title: req.body.title,
      color: req.body.color,
      type: req.body.type
    });
  } else {
    return next(new AppError('You are not authorized to Create Event Templates', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      EventTemplateTag: newEventTemplateTag,
    },
  });
});

exports.updateEventTemplateTag = catchAsync(async (req, res, next) => {
  let updatedEventTemplateTag = {
    title: req.body.title,
    color: req.body.color,
    type: req.body.type
  };

  const eventTemplateTag = await EventTemplateTag.findByIdAndUpdate(
    req.params.id,
    updatedEventTemplateTag,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventTemplateTag) {
    return next(new AppError('No eventTemplateTag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplateTag,
    },
  });
});

exports.deleteEventTemplateTag = catchAsync(async (req, res, next) => {
  const eventTemplateTag = await EventTemplateTag.findByIdAndDelete(req.params.id);

  if (eventTemplateTag) {
    const eventTemplates = await EventTemplate.find({clumpID: req.cookies.currentClumpID, eventTemplateTagID: req.params.id});
    
    for await (eventTemplate of eventTemplates) {
      const temp = await EventTemplate.findByIdAndUpdate(eventTemplate._id, {eventTemplateTagID: ''}, {
        new: true,
        runValidators: true,
      });
    }
  }

  if (!eventTemplateTag) {
    return next(new AppError('No eventTemplateTag found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
