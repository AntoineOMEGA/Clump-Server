const Role = require('../models/roleModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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