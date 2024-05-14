const Tag = require('../models/tagModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Schedule = require('../models/scheduleModel');

exports.getTags = catchAsync(async (req, res, next) => {
  const tags = await Tag.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: tags.length,
    data: {
      tags: tags,
    },
  });
});

exports.getTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!tag) {
    return next(new AppError('No tag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tag,
    },
  });
});

exports.createTag = catchAsync(async (req, res, next) => {
  let newTag;

  if (true) {
    newTag = await Tag.create({
      clumpID: req.cookies.currentClumpID,
      title: req.body.title,
      color: req.body.color,
      type: req.body.type
    });
  } else {
    return next(new AppError('You are not authorized to Create Tags', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      tag: newTag,
    },
  });
});

exports.updateTag = catchAsync(async (req, res, next) => {
  let updatedTag = {
    title: req.body.title,
    color: req.body.color,
    type: req.body.type
  };

  const tag = await Tag.findByIdAndUpdate(
    req.params.id,
    updatedTag,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tag) {
    return next(new AppError('No tag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tag,
    },
  });
});

exports.deleteTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.findByIdAndDelete(req.params.id);

  if (tag) {
    const schedules = await Schedule.find({clumpID: req.cookies.currentClumpID, tagID: req.params.id});
    
    for await (schedule of schedules) {
      const temp = await Schedule.findByIdAndUpdate(schedule._id, {tagID: ''}, {
        new: true,
        runValidators: true,
      });
    }
  }

  if (!tag) {
    return next(new AppError('No tag found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
