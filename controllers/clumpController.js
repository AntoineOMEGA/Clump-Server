const Clump = require('../models/clumpModel');
const Role = require('../models/roleModel');
const Member = require('../models/memberModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const crypto = require('crypto');

exports.getClumps = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const clumps = await features.query;

  res.status(200).json({
    status: 'success',
    results: clumps.length,
    data: {
      clumps,
    },
  });
});

exports.getClump = catchAsync(async (req, res, next) => {
  const clump = await Clump.findById(req.params.id);

  if (!clump) {
    return next(new AppError('No clump found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      clump,
    },
  });
});

exports.createClump = catchAsync(async (req, res, next) => {
  //Add Clump to Clumps Doc
  const newClump = await Clump.create({
    name: req.body.title,
    inviteToken: crypto.randomBytes(16).toString('hex'),
  });

  //Add Owner(Creator) Role to the Roles Doc
  const newOwnerRole = await Role.create({
    title: 'Owner',
    clumpID: newClump._id,
  })

  //Add Requestor Role to the Roles Doc
  const newRequestorRole = await Role.create({
    title: 'Requestor',
    clumpID: newClump._id,
  })

  //Add User to Members with Owner Role
  const newMember = await Member.create({
    clumpID: newClump._id,
    userID: 'NEED TO GET THIS',
    roleID: newOwnerRole._id,
  })

  res.status(201).json({
    status: 'success',
    data: {
      clump: newClump,
    },
  });
});

exports.updateClump = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      clump,
    },
  });
});

exports.deleteClump = catchAsync(async (req, res, next) => {
  res.status(204).json({
    status: 'success',
  });
});