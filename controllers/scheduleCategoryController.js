const ScheduleCategory = require('../models/scheduleCategoryModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Schedule = require('../models/scheduleModel');

exports.getScheduleCategories = catchAsync(async (req, res, next) => {
  const scheduleCategories = await ScheduleCategory.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: scheduleCategories.length,
    data: {
      scheduleCategories: scheduleCategories,
    },
  });
});

exports.getScheduleCategory = catchAsync(async (req, res, next) => {
  const scheduleCategory = await ScheduleCategory.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!scheduleCategory) {
    return next(new AppError('No scheduleCategory found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      scheduleCategory,
    },
  });
});

exports.createScheduleCategory = catchAsync(async (req, res, next) => {
  let newScheduleCategory;

  if (true) {
    newScheduleCategory = await ScheduleCategory.create({
      clumpID: req.cookies.currentClumpID,
      title: req.body.title,
      description: req.body.description,
      color: req.body.color,
    });
  } else {
    return next(new AppError('You are not authorized to Create Event Templates', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      scheduleCategory: newScheduleCategory,
    },
  });
});

exports.updateScheduleCategory = catchAsync(async (req, res, next) => {
  //Needs Google Integration
  let updatedScheduleCategory = {
    title: req.body.title,
    description: req.body.description,
    color: req.body.color,
  };

  const scheduleCategory = await ScheduleCategory.findByIdAndUpdate(
    req.params.id,
    updatedScheduleCategory,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!scheduleCategory) {
    return next(new AppError('No scheduleCategory found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      scheduleCategory,
    },
  });
});

exports.deleteScheduleCategory = catchAsync(async (req, res, next) => {
  //Needs Google Integration ???
  const scheduleCategory = await ScheduleCategory.findByIdAndDelete(req.params.id);

  if (scheduleCategory) {
    const schedules = await Schedule.find({clumpID: req.cookies.currentClumpID, scheduleCategoryID: req.params.id});
    
    for await (schedule of schedules) {
      const temp = await Schedule.findByIdAndUpdate(schedule._id, {scheduleCategoryID: ''}, {
        new: true,
        runValidators: true,
      });
    }
  }

  if (!scheduleCategory) {
    return next(new AppError('No scheduleCategory found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
