const Member = require('../models/memberModel')
const Clump = require('../models/clumpModel')
const Role = require('../models/roleModel')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const User = require('../models/userModel')

const getUsers = async (members) => {
  const users = {}
  for await (member of members) {
    var user = await User.findOne({ _id: member.userID })
    if (user) {
      users[member.userID] = user
    }
  }
  return users
}

const getRoles = async (clumps, members) => {
  let roles = []
  const refinedRoles = {}

  for await (clump of clumps) {
    roles = await Role.find({
      clumpID: clump._id,
    })
    for (role of roles) {
      for (member of members) {
        if (member.roleID == role._id) {
          refinedRoles[clump._id] = role
        }
      }
    }
  }
  return refinedRoles
}

exports.getMembers = catchAsync(async (req, res, next) => {
  const members = await Member.find({ clumpID: req.cookies.currentClumpID })
  const users = await getUsers(members)
  const clumps = await Clump.find({ _id: req.cookies.currentClumpID })
  const roles = await getRoles(clumps, members)

  res.status(200).json({
    status: 'success',
    results: members.length,
    data: {
      members,
      users,
      roles,
    },
  })
})

exports.getMember = catchAsync(async (req, res, next) => {
  const member = await Member.findById(req.params.id)

  if (!member) {
    return next(new AppError('No member found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      member,
    },
  })
})

exports.createMember = catchAsync(async (req, res, next) => {
  const clump = await Clump.findOne({ inviteToken: req.body.inviteToken })
  const role = await Role.findOne({
    title: 'Invited Member',
    clumpID: clump._id,
  })

  const member = await Member.findOne({
    clumpID: clump._id,
    userID: req.cookies.currentUserID,
  })

  if (member) {
    return next(new AppError('User has already joined this Clump', 400))
  }

  const newMember = await Member.create({
    clumpID: clump._id,
    userID: req.cookies.currentUserID,
    roleID: role._id,
  })
  console.log(newMember.roleID)

  res.status(201).json({
    status: 'success',
    data: {
      member: newMember,
    },
  })
})

exports.updateMember = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      member,
    },
  })
})

exports.deleteMember = catchAsync(async (req, res, next) => {
  //Check if Member is Owner and whether there are other Members with Admin role
  const member = await Member.findOne({ _id: req.params.id })

  const role = await Role.findOne({
    clumpID: member.clumpID,
    _id: member.roleID,
  })

  if (role.title !== 'Owner') {
    await Member.findByIdAndDelete(req.params.id)
    console.log(role, ' in IF')
  } else {
    const ownerMembers = await Member.find({
      roleID: role._id,
    })

    if (ownerMembers.length > 1) {
      console.log(ownerMembers)
      await Member.findByIdAndDelete(req.params.id)
    } else {
      return next(
        new AppError(
          'You can not leave unless someone else has the Owner role!',
          400
        )
      )
    }
  }

  res.status(204).json({
    status: 'success',
  })
})
