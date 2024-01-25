const Clump = require('../models/clumpModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
  //Add Owner(Creator) Role to the Roles Doc
  //Add Requestor Role to the Roles Doc
  //Generate Invite Token
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