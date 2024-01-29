const Assignment = require('../models/assignmentModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAssignments = catchAsync(async (req, res, next) => {
  const assignments = await Assignment.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: assignments.length,
    data: {
      assignments: assignments,
    },
  });
});

exports.getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      assignment,
    },
  });
});

exports.createAssignment = catchAsync(async (req, res, next) => {
  const member = await Member.findOne({userID: req.cookies.currentUserID, clumpID: req.cookies.currentClumpID});
  const role = await Role.findOne({_id: member.roleID});
  let newAssignment = undefined;

  if (role.canCreateAssignments) {
    newAssignment = await Assignment.create({
      clumpID: req.cookies.currentClumpID,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
    });
    // and propogate permissions to self and above roles
  } else {
    return next(new AppError('You are not authorized to Create Assignments', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      assignment: newAssignment,
    },
  });
});

exports.updateAssignment = catchAsync(async (req, res, next) => {
  //Needs Google Integration

  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      assignment,
    },
  });
});

exports.deleteAssignment = catchAsync(async (req, res, next) => {
  //Needs Google Integration ???
  const assignment = await Assignment.findByIdAndDelete(req.params.id);

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
