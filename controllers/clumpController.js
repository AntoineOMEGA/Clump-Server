const Clump = require('../models/clumpModel');
const Role = require('../models/roleModel');
const Member = require('../models/memberModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const crypto = require('crypto');

exports.getClumps = catchAsync(async (req, res, next) => {
  const memberInClumps = await Member.find({
    userID: req.cookies.currentUserID,
  });

  const clumps = [];

  memberInClumps.forEach(async function (memberInClump) {
    let clump = await Clump.findOne({
      _id: memberInClump.clumpID
    })
    clumps.push(clump);
  })

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
    title: req.body.title,
    inviteToken: crypto.randomBytes(16).toString('hex'),
  });

  //Add Owner(Creator) Role to the Roles Doc
  const newOwnerRole = await Role.create({
    title: 'Owner',
    clumpID: newClump._id,
  });

  //Add InvitedMember Role to the Roles Doc
  const newInvitedMemberRole = await Role.create({
    title: 'InvitedMember',
    clumpID: newClump._id,
  });

  //Add User to Members with Owner Role
  const newMember = await Member.create({
    clumpID: newClump._id,
    userID: req.cookies.currentUserID,
    roleID: newOwnerRole._id,
  });

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
