const Schedule = require('../models/scheduleModel');
const ScheduleCategories = require('../models/scheduleCategoryModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Clump = require('../models/clumpModel');
const Event = require('../models/eventModel');
const RecurringEvent = require('../models/recurringEventModel');
const EventTemplate = require('../models/eventTemplateModel');

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
    active: true,
  });

  const scheduleCategories = await ScheduleCategories.find({
    clumpID: req.cookies.currentClumpID,
  });

  const eventTemplates = await EventTemplate.find({
    clumpID: req.cookies.currentClumpID,
  });

  let eventQuery = {
    startDateTime: {
      $gte: new Date(req.query.startDate).toISOString().replace('Z', '+00:00'),
      $lt: new Date(req.query.endDate).toISOString().replace('Z', '+00:00'),
    },
    eventTemplateID: {
      $exists: true,
    },
  };
  /*
  for (let eventTemplate of eventTemplates) {
    eventQuery.$or.push({eventTemplateID: eventTemplate._id});
  }
*/
  const events = await Event.find(eventQuery);

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      scheduleCategories: scheduleCategories,
      schedules: schedules,
      eventTemplates: eventTemplates,
      events: events,
    },
  });
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
      title: googleCalendarTitle,
      scheduleCategoryID: req.body.scheduleCategoryID,
      clumpID: req.cookies.currentClumpID,
      googleCalendarID: googleCalendarID,
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
  //Needs Google Integration ???
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
