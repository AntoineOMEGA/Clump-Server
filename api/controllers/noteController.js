const Note = require('../models/noteModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Schedule = require('../models/scheduleModel');

exports.getNotes = catchAsync(async (req, res, next) => {
  const notes = await Note.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: {
      notes: notes,
    },
  });
});

exports.getNote = catchAsync(async (req, res, next) => {
  const note = await Note.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!note) {
    return next(new AppError('No note found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      note,
    },
  });
});

exports.createNote = catchAsync(async (req, res, next) => {
  let newNote;

  if (true) {
    newNote = await Note.create({
      clumpID: req.cookies.currentClumpID,
      title: req.body.title,
      color: req.body.color,
      type: req.body.type
    });
  } else {
    return next(new AppError('You are not authorized to Create Notes', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      note: newNote,
    },
  });
});

exports.updateNote = catchAsync(async (req, res, next) => {
  let updatedNote = {
    title: req.body.title,
    color: req.body.color,
    type: req.body.type
  };

  const note = await Note.findByIdAndUpdate(
    req.params.id,
    updatedNote,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!note) {
    return next(new AppError('No note found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      note,
    },
  });
});

exports.deleteNote = catchAsync(async (req, res, next) => {
  const note = await Note.findByIdAndDelete(req.params.id);

  if (note) {
    const schedules = await Schedule.find({clumpID: req.cookies.currentClumpID, noteID: req.params.id});
    
    for await (schedule of schedules) {
      const temp = await Schedule.findByIdAndUpdate(schedule._id, {noteID: ''}, {
        new: true,
        runValidators: true,
      });
    }
  }

  if (!note) {
    return next(new AppError('No note found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
