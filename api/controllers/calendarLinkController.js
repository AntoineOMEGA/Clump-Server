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

exports.aliasGenerateICal = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({
    _id: req.params.id,
    clumpID: req.cookies.currentClumpID,
  });

  const icsContent = ical({ name: 'Test Cal' });

  res.setHeader('Content-Type', 'text/calendar');
  res.send(icsContent);
});
