const Event = require('../models/eventModel');
const EventException = require('../models/eventExceptionModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;

exports.getEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({scheduleID: req.body.scheduleID});

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

exports.getEventsOnSchedule = catchAsync(async (req, res, next) => {
  const events = await Event.find({scheduleID: req.params.id});

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
})

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  let eventToCreate = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    frequency: req.body.frequency,
    interval: req.body.interval,
    untilDateTime: req.body.untilDateTime,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  };

  let newEvent = await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      newEvent,
    },
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  let updatedEvent = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  };

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    updatedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.updateThisEvent = catchAsync(async (req, res, next) => {
  let eventExceptionToCreate = {
    eventID: req.params.id,
    startDateTime: req.body.startDateTime
  }
  let newEventException = await EventException.create(eventExceptionToCreate);

  let eventToCreate = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    frequency: req.body.frequency,
    interval: req.body.interval,
    untilDateTime: req.body.untilDateTime,
  }
  let newEvent = await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      newEvent,
      newEventException
    },
  });
});

exports.updateThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  let updatedEvent = {};

  updatedEvent.untilDateTime = untilDate;

  const currentEvent = await Event.findByIdAndUpdate(
    req.params.id,
    updatedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  let eventToCreate = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    frequency: req.body.frequency,
    interval: req.body.interval,
    untilDateTime: req.body.untilDateTime,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  }
  let newEvent = await Event.create(eventToCreate);

  let eventExceptions;

  if (new Date(currentEvent.startDateTime).getDay() != new Date(eventToCreate.startDateTime).getDay()) {
    eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});
  } else {
    eventExceptions = await EventException.updateMany(
      {$and: [{eventID:{$eq: req.params.id}}, {startDateTime: {$gte: req.body.startDateTime}}]},  
      {eventID: newEvent._id}, function (err, eventExceptions) { 
      if (err){ 
        return next(new AppError('Issue updating Event Exceptions', 400));
      }
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      currentEvent,
      newEvent,
      eventExceptions
    },
  });
});

exports.updateAllEvents = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);

  let updatedEvent = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    frequency: req.body.frequency,
    interval: req.body.interval,
    untilDateTime: req.body.untilDateTime,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
  };

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    updatedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  if (new Date(currentEvent.startDateTime).getDay() != new Date(event.startDateTime).getDay()) {
    const eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});

exports.deleteThisEvent = catchAsync(async (req, res, next) => {
  let eventExceptionToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.params.id,
    startDateTime: req.body.startDateTime
  }
  let eventException = await EventException.create(eventExceptionToCreate);

  res.status(201).json({
    status: 'success',
    data: {
      eventException,
    },
  });
});

exports.deleteThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  let updatedEvent = {
    untilDateTime: untilDate,
  };

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    updatedEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  let eventExceptions = await EventException.deleteMany({$and: [{eventID: {$eq: req.params.id}}, {startDateTime: {$gte: req.body.startDateTime}}]});

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.deleteAllEvents = catchAsync(async (req, res, next) => {
  const event = await Event.deleteOne({_id: req.params.id});
  const eventExceptions = await EventException.deleteMany({eventID: {$eq: req.params.id}});

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});



exports.aliasLoadSchedule = catchAsync(async (req, res, next) => {
  req.query.startDate = "2024-05-01T22:34:50.747Z";
  req.query.endDate = "2024-06-30T22:54:50.747Z";

  let eventQuery = {
    scheduleID: req.params.id,
    $and: [
      {
        startDateTime: {
          $gte: new Date(req.query.startDate).toISOString(),
          $lt: new Date(req.query.endDate).toISOString(),
        }
      }
    ]
  };

  let events = await Event.find(eventQuery);

  let eventInstances = [];

  for (let event of events) {
    let rruleString = '';
    if (event.frequency != 'Once') {
      rruleString = rruleString + 'FREQ=' + event.frequency + ';';
    }

    if (event.interval) {
      rruleString = rruleString + 'INTERVAL=' + event.interval + ';';
    }

    let byDay;

    if (byDay && byDay.length > 0) {
      let byDayString = '';
      for (let day of byDay) {
        byDayString = byDayString + day + ',';
      }
      rruleString = rruleString + 'BYDAY=' + byDayString.substring(0, byDayString.length - 1) +';';
    }


    if (event.untilDateTime) {
      rruleString = rruleString + 'UNTIL=' + new Date(event.untilDateTime).toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0] + ';';
    }

    rruleString = rruleString + 'DTSTART=' + new Date(event.startDateTime).toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0] + ';';
    console.log(rruleString);

    const rrule = RRule.fromString(
      rruleString.substring(0, rruleString.length - 1)
    );

    let tStart = new Date(req.query.startDate);
    let tEnd = new Date(req.query.endDate);

    let dates = rrule.between(
      datetime(
        tStart.getUTCFullYear(),
        tStart.getUTCMonth() + 1,
        tStart.getUTCDate()
      ),
      datetime(tEnd.getUTCFullYear(), tEnd.getUTCMonth() + 1, tEnd.getUTCDate())
    );

    console.log(dates);

    if (dates.length > 0) {
      events.push(event);
    }

    for (let date of dates) {
      let eventInstance = {
        _id: event._id + dayjs(date).toISOString(),
        startDateTime: event.startDateTime + ' - ' + date, //adjust for new date
        endDateTime: event.endDateTime + ' - ' + date, //adjust for new date
      }
      eventInstances.push(eventInstance);
    }
  }

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events: events,
      eventInstances: eventInstances,
    },
  });
});