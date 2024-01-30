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

  newRoleFormData.canViewAssignments.forEach(assignment => {
    console.log(assignment);
    let filteredCanViewAssignments = [];
    if (creatorRole.canViewAssignments.includes() || creatorRole.title == 'Owner') {
      console.log(assignment);
      filteredCanViewAssignments.push(assignment);
    }
    newRoleFormData.canViewAssignments = filteredCanViewAssignments;
  })

  newRoleFormData.canEditAssignments.forEach(assignment => {
    console.log(assignment);
    let filteredCanEditAssignments = [];
    if (creatorRole.canEditAssignments.includes() || creatorRole.title == 'Owner') {
      console.log(assignment);
      filteredCanEditAssignments.push(assignment);
    }
    newRoleFormData.canEditAssignments = filteredCanEditAssignments;
  })

  newRoleFormData.canViewSchedules.forEach(assignment => {
    console.log(assignment);
    let filteredCanViewSchedules = [];
    if (creatorRole.canViewSchedules.includes() || creatorRole.title == 'Owner') {
      console.log(assignment);
      filteredCanViewSchedules.push(assignment);
    }
    newRoleFormData.canViewSchedules = filteredCanViewSchedules;
  })

  newRoleFormData.canEditSchedules.forEach(assignment => {
    console.log(assignment);
    let filteredCanEditSchedules = [];
    if (creatorRole.canEditSchedules.includes() || creatorRole.title == 'Owner') {
      console.log(assignment);
      filteredCanEditSchedules.push(assignment);
    }
    newRoleFormData.canEditSchedules = filteredCanEditSchedules;
  })

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