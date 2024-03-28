const Shift = require('../models/shiftModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getShifts = catchAsync(async (req, res, next) => {
  const shifts = await Shift.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: shifts.length,
    data: {
      shifts: shifts,
    },
  });
});

exports.getShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!shift) {
    return next(new AppError('No shift found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shift,
    },
  });
});

exports.createShift = catchAsync(async (req, res, next) => {
  let newShift;

  if (true) {
    newShift = await Shift.create({
      clumpID: req.cookies.currentClumpID,
      eventTemplateID: req.body.eventTemplateID,
      dayOfWeek: req.body.dayOfWeek,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
  } else {
    return next(new AppError('You are not authorized to Create Event Templates', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      shift: newShift,
    },
  });
});

exports.updateShift = catchAsync(async (req, res, next) => {
  let updatedShift = {
    dayOfWeek: req.body.dayOfWeek,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
  };

  const shift = await Shift.findByIdAndUpdate(
    req.params.id,
    updatedShift,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!shift) {
    return next(new AppError('No shift found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shift,
    },
  });
});

exports.deleteShift = catchAsync(async (req, res, next) => {
  const shift = await Shift.findByIdAndDelete(req.params.id);

  if (!shift) {
    return next(new AppError('No shift found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
