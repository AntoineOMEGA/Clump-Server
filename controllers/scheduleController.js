const Schedule = require('../models/scheduleModel');
const ScheduleCategories = require('../models/scheduleCategoryModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel');
const EventTemplate = require('../models/eventTemplateModel');
const Shift = require('../models/shiftModel');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;
const datetime = RRuleLib.datetime;

exports.getSchedules = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({
    clumpID: req.cookies.currentClumpID,
    active: true,
  });

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: {
      schedules: schedules,
    },
  });
});

exports.getSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({
    _id: req.params.id,
    clumpID: req.cookies.currentClumpID,
  });

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplate,
    },
  });
});

exports.aliasCombineSchedules = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({
    clumpID: req.cookies.currentClumpID,
  });

  const scheduleCategories = await ScheduleCategories.find({
    clumpID: req.cookies.currentClumpID,
  });

  const eventTemplates = await EventTemplate.find({
    clumpID: req.cookies.currentClumpID,
  });

  const shifts = await Shift.find({
    clumpID: req.cookies.currentClumpID,
  });

  let singleEventQuery = {
    startDateTime: {
      $gte: new Date(req.query.startDate).toISOString(),
      $lt: new Date(req.query.endDate).toISOString(),
    },
    eventTemplateID: {
      $exists: true,
    },
    until: {
      $exists: false,
    },
  };

  let recurringEventQuery = {
    startDateTime: {
      $lt: new Date(req.query.startDate).toISOString(),
    },
    until: {
      $gte: new Date(req.query.endDate).toISOString(),
    },
    eventTemplateID: {
      $exists: true,
    },
    until: {
      $exists: true,
    },
  };
  /*
  for (let eventTemplate of eventTemplates) {
    eventQuery.$or.push({eventTemplateID: eventTemplate._id});
  }
*/
  const events = await Event.find(singleEventQuery);
  const rEvents = await Event.find(recurringEventQuery);

  let fEvents = [];

  fEvents = events;

  for (let event of rEvents) {
    let rruleString = '';
    if (event.recurrence.frequency != 'Once') {
      rruleString = rruleString + 'FREQ=' + event.recurrence.frequency + ';';
    }

    if (event.recurrence.interval) {
      rruleString = rruleString + 'INTERVAL=' + event.recurrence.interval + ';';
    }

    if (event.recurrence.byMonth) {
      rruleString = rruleString + 'BYMONTH=' + event.recurrence.byMonth + ';';
    }

    if (event.recurrence.byDay && event.recurrence.byDay.length > 0) {
      let byDayString = '';
      for (let day of event.recurrence.byDay) {
        byDayString = byDayString + day + ',';
      }
      rruleString =
        rruleString +
        'BYDAY=' +
        byDayString.substring(0, byDayString.length - 1) +
        ';';
    }

    if (event.recurrence.byMonthDay && event.recurrence.byMonthDay.length > 0) {
      let byMonthDayString = '';
      for (let day of event.recurrence.byMonthDay) {
        byMonthDayString = byMonthDayString + day + ',';
      }
      rruleString =
        rruleString +
        'BYMONTHDAY=' +
        byMonthDayString.substring(0, byMonthDayString.length - 1) +
        ';';
    }

    const rrule = RRule.fromString(
      rruleString.substring(0, rruleString.length - 1)
    );

    let tStart = new Date(req.query.startDate);
    let tEnd = new Date(req.query.endDate);

    let dates = rrule.between(
      datetime(
        tStart.getUTCFullYear(),
        tStart.getUTCMonth(),
        tStart.getUTCDate()
      ),
      datetime(tEnd.getUTCFullYear(), tEnd.getUTCMonth(), tEnd.getUTCDate())
    );

    console.log(dates);

    fEvents.push(event);
  }

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      scheduleCategories: scheduleCategories,
      schedules: schedules,
      eventTemplates: eventTemplates,
      events: events,
      shifts: shifts,
    },
  });
});

exports.aliasGenerateICal = catchAsync(async (req, res, next) => {
  const events = await Event.find();
});

exports.createSchedule = catchAsync(async (req, res, next) => {
  const member = await Member.findOne({
    userID: req.cookies.currentUserID,
    clumpID: req.cookies.currentClumpID,
  });
  const role = await Role.findOne({ _id: member.roleID });
  let newSchedule;

  if (role.canCreateSchedules) {
    newSchedule = await Schedule.create({
      clumpID: req.cookies.currentClumpID,
      scheduleCategoryID: req.body.scheduleCategoryID,

      title: req.body.title,
      timeZone: 'America/Denver',

      startDate: req.body.startDate,
      endDate: req.body.endDate,
      comments: req.body.comments,
    });

    role.canViewSchedules.push(newSchedule._id);
    role.canEditSchedules.push(newSchedule._id);
    await role.save();

    let parentRoleID = role.parentRole;
    while (parentRoleID !== undefined) {
      let parentRole = await Role.findOne({ _id: parentRoleID });
      parentRole.canViewSchedules.push(newSchedule._id);
      parentRole.canEditSchedules.push(newSchedule._id);
      await parentRole.save();
    }
  } else {
    return next(
      new AppError('You are not authorized to Create Event Templates', 401)
    );
  }

  res.status(201).json({
    status: 'success',
    data: {
      schedule: newSchedule,
    },
  });
});

exports.updateSchedule = catchAsync(async (req, res, next) => {
  let updatedSchedule = {
    title: req.body.title,
    scheduleCategoryID: req.body.scheduleCategoryID,
    comments: req.body.comments,
  };

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    updatedSchedule,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      schedule,
    },
  });
});

exports.deleteSchedule = catchAsync(async (req, res, next) => {
  let deletedSchedule = {
    active: false,
  };

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    deletedSchedule,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
