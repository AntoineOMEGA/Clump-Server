const Assignment = require('../models/assignmentModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAssignments = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Assignment.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const assignments = await features.query;

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
  const newAssignment = await Assignment.create({
    title: req.body.title,
    dressCode: req.body.dressCode,
    contact: req.body.contact,
  });

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
