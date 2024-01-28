const Clump = require('../models/clumpModel');
const Role = require('../models/roleModel');
const Member = require('../models/memberModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const crypto = require('crypto');

const getClumps = async (members) => {
  const clumps = [];

  for await (member of members) {
    var clump = await Clump.findOne({
      _id: member.clumpID
    })
    clumps.push(clump);
  }
  return clumps;
}

const getRoles = async (clumps, members) => {
  let roles = [];
  const refinedRoles = {};

  for await (clump of clumps) {
    roles = await Role.find({
      clumpID: clump._id,
    })
    for (role of roles) {
      for (member of members) {
        if (member.roleID == role._id) {
          refinedRoles[clump._id] = role;
        }
      }
    }
  }
  return refinedRoles;
}

exports.getClumps = catchAsync(async (req, res, next) => {
  const members = await Member.find({
    userID: req.cookies.currentUserID,
  });

  const clumps = await getClumps(members);
  const roles = await getRoles(clumps, members);
  const membersObj = {};
  for await (member of members) {
    membersObj[member._id] = member;
  }

  res.status(200).json({
    status: 'success',
    results: clumps.length,
    data: {
      clumps,
      roles,
      members: membersObj,
    },
  });
});

exports.getClump = catchAsync(async (req, res, next) => {
  const clump = await Clump.findById(req.params.id);

  if (!clump) {
    return next(new AppError('No clump found with that ID', 404));
  }

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('currentClumpID', req.params.id, cookieOptions);

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
    title: 'Invited Member',
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
