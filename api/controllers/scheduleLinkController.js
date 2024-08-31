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
  const schedule = await Schedule.findById(req.params.id);

  const icsContent = ical({ name: 'Test Cal' });

  res.setHeader('Content-Type', 'text/calendar');
  res.send(icsContent);
});

exports.getScheduleLinks = catchAsync(async (req, res, next) => {
  const scheduleLinks = await ScheduleLink.find({scheduleID: req.params.id});

  res.status(200).json({
    status: 'success',
    results: scheduleLinks.length,
    data: {
      scheduleLinks: scheduleLinks,
    },
  });
});

exports.createScheduleLink = catchAsync(async (req, res, next) => {
  let scheduleLinks = [];

  for (recipient in req.body.recipients) {
    let newScheduleLink = await ScheduleLink.create({
      scheduleID: req.params.id,
      recipient: recipient
    });

    scheduleLinks.push(newScheduleLink);
  }

  res.status(201).json({
    status: 'success',
    data: {
      scheduleLinks: scheduleLinks,
    },
  });
});

exports.deleteScheduleLink = catchAsync(async (req, res, next) => {
  const scheduleLink = await ScheduleLink.findByIdAndDelete(req.params.linkId);

  if (!scheduleLink) {
    return next(new AppError('No scheduleLink found with that ID', 404));
  }

  res.status(204).send();
});
