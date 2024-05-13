const ScheduleTag = require('../models/scheduleTagModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Schedule = require('../models/scheduleModel');

exports.getScheduleTags = catchAsync(async (req, res, next) => {
  const scheduleTags = await ScheduleTag.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: scheduleTags.length,
    data: {
      scheduleTags: scheduleTags,
    },
  });
});

exports.getScheduleTag = catchAsync(async (req, res, next) => {
  const scheduleTag = await ScheduleTag.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!scheduleTag) {
    return next(new AppError('No scheduleTag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      scheduleTag,
    },
  });
});

exports.createScheduleTag = catchAsync(async (req, res, next) => {
  let newScheduleTag;

  if (true) {
    newScheduleTag = await ScheduleTag.create({
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
      scheduleTag: newScheduleTag,
    },
  });
});

exports.updateScheduleTag = catchAsync(async (req, res, next) => {
  //Needs Google Integration
  let updatedScheduleTag = {
    title: req.body.title,
    color: req.body.color,
    type: req.body.type
  };

  const scheduleTag = await ScheduleTag.findByIdAndUpdate(
    req.params.id,
    updatedScheduleTag,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!scheduleTag) {
    return next(new AppError('No scheduleTag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      scheduleTag,
    },
  });
});

exports.deleteScheduleTag = catchAsync(async (req, res, next) => {
  const scheduleTag = await ScheduleTag.findByIdAndDelete(req.params.id);

  if (scheduleTag) {
    const schedules = await Schedule.find({clumpID: req.cookies.currentClumpID, scheduleTagID: req.params.id});
    
    for await (schedule of schedules) {
      const temp = await Schedule.findByIdAndUpdate(schedule._id, {scheduleTagID: ''}, {
        new: true,
        runValidators: true,
      });
    }
  }

  if (!scheduleTag) {
    return next(new AppError('No scheduleTag found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
