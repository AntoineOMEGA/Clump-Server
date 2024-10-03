const EventException = require('../models/eventExceptionModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteEventException = catchAsync(async (req, res, next) => {
  const eventException = await EventException.findByIdAndDelete(req.params.id);

  if (!eventException) {
    return next(new AppError('No Event Exception found with that ID', 404));
  }

  res.status(204).send();
});
