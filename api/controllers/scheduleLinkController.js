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
  console.log("hi");
  const schedule = await Schedule.findById(req.params.id);
  const calendar = ical({ name: schedule.title });

  let eventQuery = {
    scheduleID: req.params.id
  };

  const events = await Event.find(eventQuery);

  for (let event of events) {
    let tempEvent = calendar.createEvent({
      summary: event.title,
      description: event.description,
      location: event.location,
      timezone: event.timeZone,
      start: event.startDateTime,
      end: event.endDateTime,

      created: event.createdDateTime,
      lastModified: event.modifiedDateTime
    })
  }

  

  console.log(calendar.toString());
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
  //let scheduleLinks = [];

  // for (recipient in req.body.recipients) {
  //   let newScheduleLink = await ScheduleLink.create({
  //     scheduleID: req.params.id,
  //     recipient: recipient
  //   });

  //   scheduleLinks.push(newScheduleLink);
  // }

  let newScheduleLink = await ScheduleLink.create({
    scheduleID: req.params.id,
    recipient: req.body.recipient
  });

  res.status(201).json({
    status: 'success',
    data: {
      scheduleLink: newScheduleLink,
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
