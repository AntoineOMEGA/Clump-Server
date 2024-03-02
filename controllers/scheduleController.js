const Schedule = require('../models/scheduleModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getSchedules = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: schedule.length,
    data: {
      schedule: schedule,
    },
  });
});

exports.getSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

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

exports.createSchedule = catchAsync(async (req, res, next) => {
  const member = await Member.findOne({userID: req.cookies.currentUserID, clumpID: req.cookies.currentClumpID});
  const role = await Role.findOne({_id: member.roleID});
  let newSchedule;

  console.log(req.body.googleCalendarID);

  if (role.canCreateSchedules) {
    newSchedule = await Schedule.create({
      title: req.body.title,
      clumpID: req.cookies.currentClumpID,
      googleCalendarID: req.body.googleCalendarID,
    });
    // and propogate permissions to self and above roles

    role.canViewSchedules.push(newSchedule._id);
    role.canEditSchedules.push(newSchedule._id);
    await role.save();

    let parentRoleID = role.parentRole;
    while (parentRoleID !== undefined) {
      let parentRole = await Role.findOne({_id: parentRoleID});
      parentRole.canViewSchedules.push(newSchedule._id);
      parentRole.canEditSchedules.push(newSchedule._id);
      await parentRole.save();
    }
  } else {
    return next(new AppError('You are not authorized to Create Event Templates', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      schedule: newSchedule,
    },
  });
});

exports.updateSchedule = catchAsync(async (req, res, next) => {
  //Needs Google Integration

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
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
  //Needs Google Integration ???
  const schedule = await Schedule.findByIdAndDelete(req.params.id);

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
