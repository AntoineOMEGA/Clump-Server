const Role = require('../models/roleModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Member = require('../models/memberModel');

exports.getRoles = catchAsync(async (req, res, next) => {
  const roles = await Role.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: {
      roles,
    },
  });
});

exports.getRole = catchAsync(async (req, res, next) => {
  const role = await Role.findById(req.params.id);

  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      role,
    },
  });
});

exports.createRole = catchAsync(async (req, res, next) => {
  const member = await Member.findOne({userID: req.cookies.currentUserID, clumpID: req.cookies.currentClumpID})
  const creatorRole = await Role.findById(member.roleID);

  const newRoleFormData = {
    title: req.body.title,
    clumpID: req.cookies.currentClumpID,
    canViewAssignments: req.body.canViewAssignments,
    canEditAssignments: req.body.canEditAssignments,
    canViewSchedules: req.body.canViewSchedules,
    canEditSchedules: req.body.canEditSchedules,
    canCreateAssignments: req.body.canCreateAssignments,
    canCreateEvents: req.body.canCreateEvents,
    canCreateRoles: req.body.canCreateRoles,
    canCreateSchedules: req.body.canCreateSchedules,
    parentRole: req.body.parentRole,
  }

  //Filter Can View Assignments
  for (assignment in newRoleFormData.canViewAssignments) {
    let filteredCanViewAssignments = [];
    if (creatorRole.canViewAssignments.includes(assignment)) {
      filteredCanViewAssignments.push(assignment);
    }
    newRoleFormData.canViewAssignments = filteredCanViewAssignments;
  }

  //Filter Can Edit Assignments
  for (assignment in newRoleFormData.canEditAssignments) {
    let filteredCanEditAssignments = [];
    if (creatorRole.canEditAssignments.includes(assignment)) {
      filteredCanEditAssignments.push(assignment);
    }
    newRoleFormData.canEditAssignments = filteredCanEditAssignments;
  }

  //Filter Can View Schedules
  for (schedule in newRoleFormData.canViewSchedules) {
    let filteredCanViewSchedules = [];
    if (creatorRole.canViewSchedules.includes(schedule)) {
      filteredCanViewSchedules.push(schedule);
    }
    newRoleFormData.canViewSchedules = filteredCanViewSchedules;
  }

  //Filter Can Edit Schedules
  for (schedule in newRoleFormData.canEditSchedules) {
    let filteredCanEditSchedules = [];
    if (creatorRole.canEditSchedules.includes(schedule)) {
      filteredCanEditSchedules.push(schedule);
    }
    newRoleFormData.canEditSchedules = filteredCanEditSchedules;
  }

  if (!creatorRole.canCreateAssignments) {
    newRoleFormData.canCreateAssignments = false;
  }

  if (!creatorRole.canCreateEvents) {
    newRoleFormData.canCreateEvents = false;
  }

  if (!creatorRole.canCreateRoles) {
    newRoleFormData.canCreateRoles = false;
  }

  if (!creatorRole.canCreateSchedules) {
    newRoleFormData.canCreateSchedules = false;
  }

  if (newRoleFormData.parentRole == '') {
    newRoleFormData.parentRole = creatorRole._id;
  }

  const newRole = await Role.create(newRoleFormData);

  res.status(201).json({
    status: 'success',
    data: {
      role: newRole,
    },
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      role,
    },
  });
});

exports.deleteRole = catchAsync(async (req, res, next) => {
  res.status(204).json({
    status: 'success',
  });
});