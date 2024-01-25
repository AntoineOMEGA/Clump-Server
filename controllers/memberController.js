const Member = require('../models/memberModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getMembers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const members = await features.query;

  res.status(200).json({
    status: 'success',
    results: members.length,
    data: {
      members,
    },
  });
});

exports.getMember = catchAsync(async (req, res, next) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      member,
    },
  });
});

exports.createMember = catchAsync(async (req, res, next) => {
  res.status(201).json({
    status: 'success',
    data: {
      member: newMember,
    },
  });
});

exports.updateMember = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      member,
    },
  });
});

exports.deleteMember = catchAsync(async (req, res, next) => {
  res.status(204).json({
    status: 'success',
  });
});