const ScheduleLink = require('../models/scheduleLinkModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;
const datetime = RRuleLib.datetime;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const ical = require('ical-generator');

exports.generateICal = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({
    _id: req.params.id,
    clumpID: req.cookies.currentClumpID,
  });

  const icsContent = ical({ name: 'Test Cal' });

  res.setHeader('Content-Type', 'text/calendar');
  res.send(icsContent);
});

exports.getScheduleLinks = catchAsync(async (req, res, next) => {
  const scheduleLinks = await ScheduleLink.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: scheduleLinks.length,
    data: {
      scheduleLinks: scheduleLinks,
    },
  });
});

exports.getScheduleLink = catchAsync(async (req, res, next) => {
  const scheduleLink = await ScheduleLink.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!scheduleLink) {
    return next(new AppError('No scheduleLink found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      scheduleLink,
    },
  });
});

exports.createScheduleLink = catchAsync(async (req, res, next) => {
  let newScheduleLink;

  if (true) {
    newScheduleLink = await ScheduleLink.create({
      clumpID: req.cookies.currentClumpID,
      title: req.body.title,
      scheduleLink: req.body.scheduleLink,
      tagIDs: req.body.tagIDs
    });
  } else {
    return next(new AppError('You are not authorized to Create ScheduleLinks', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      scheduleLink: newScheduleLink,
    },
  });
});

exports.updateScheduleLink = catchAsync(async (req, res, next) => {
  let updatedScheduleLink = {
    title: req.body.title,
    scheduleLink: req.body.scheduleLink,
    tagIDs: req.body.tagIDs
  };

  const scheduleLink = await ScheduleLink.findByIdAndUpdate(
    req.params.id,
    updatedScheduleLink,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!scheduleLink) {
    return next(new AppError('No scheduleLink found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      scheduleLink,
    },
  });
});

exports.deleteScheduleLink = catchAsync(async (req, res, next) => {
  const scheduleLink = await ScheduleLink.findByIdAndDelete(req.params.id);

  if (!scheduleLink) {
    return next(new AppError('No scheduleLink found with that ID', 404));
  }

  res.status(204).send();
});
