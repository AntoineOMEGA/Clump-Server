const District = require('../models/districtModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getDistricts = catchAsync(async (req, res, next) => {
  const districts = await District.find();

  res.status(200).json({
    status: 'success',
    results: districts.length,
    data: {
      districts: districts,
    },
  });
});

exports.getDistrict = catchAsync(async (req, res, next) => {
  const district = await District.findById(req.params.id);

  if (!district) {
    return next(new AppError('No district found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      district,
    },
  });
});

exports.createDistrict = catchAsync(async (req, res, next) => {
  const newDistrict = await District.create({
    title: req.body.title,
    dressCode: req.body.dressCode,
    contact: req.body.contact,
  });

  res.status(201).json({
    status: 'success',
    data: {
      district: newDistrict,
    },
  });
});

exports.updateDistrict = catchAsync(async (req, res, next) => {
  const district = await District.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!district) {
    return next(new AppError('No district found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      district,
    },
  });
});

exports.deleteDistrict = catchAsync(async (req, res, next) => {
  const district = await District.findByIdAndDelete(req.params.id);

  if (!district) {
    return next(new AppError('No district found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
