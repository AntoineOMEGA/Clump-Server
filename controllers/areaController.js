const Area = require('../models/areaModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAreas = catchAsync(async (req, res, next) => {
  const areas = await Area.find();

  res.status(200).json({
    status: 'success',
    results: areas.length,
    data: {
      areas: areas,
    },
  });
});

exports.getArea = catchAsync(async (req, res, next) => {
  const area = await Area.findById(req.params.id);

  if (!area) {
    return next(new AppError('No area found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      area,
    },
  });
});

exports.createArea = catchAsync(async (req, res, next) => {
  const newArea = await Area.create({
    title: req.body.title,
    dressCode: req.body.dressCode,
    contact: req.body.contact,
  });

  res.status(201).json({
    status: 'success',
    data: {
      area: newArea,
    },
  });
});

exports.updateArea = catchAsync(async (req, res, next) => {
  const area = await Area.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!area) {
    return next(new AppError('No area found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      area,
    },
  });
});

exports.deleteArea = catchAsync(async (req, res, next) => {
  const area = await Area.findByIdAndDelete(req.params.id);

  if (!area) {
    return next(new AppError('No area found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
