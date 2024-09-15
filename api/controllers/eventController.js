const Event = require('../models/eventModel');
const EventException = require('../models/eventExceptionModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;
const datetime = RRuleLib.datetime;
const dayjs = require('dayjs');

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

const findInstancesInRange = (events, eventExceptions, startDateTime, endDateTime) => {
  let eventInstances = [];

  for (let event of events) {
    let rruleString;
    if (event.recurrenceRule.frequency == 'Daily' || event.recurrenceRule.frequency == 'Weekly') {
      rruleString = 'FREQ=' + event.recurrenceRule.frequency + ';';
    } else if (event.recurrenceRule.frequency == 'Monthly by day' || event.recurrenceRule.frequency == 'Monthly by date') {
      rruleString = 'FREQ=MONTHLY;';
    } else if (event.recurrenceRule.frequency == 'Yearly by day' || event.recurrenceRule.frequency == 'Yearly by date') {
      rruleString = 'FREQ=YEARLY;';
    }
    

    if (event.recurrenceRule.interval) {
      rruleString = rruleString + 'INTERVAL=' + event.recurrenceRule.interval + ';';
    }

    if (event.recurrenceRule.byMonth) {
      rruleString = rruleString + 'BYMONTH=' + event.recurrenceRule.byMonth + ';';
    }

    if (event.recurrenceRule.byDay && event.recurrenceRule.byDay.length > 0) {
      let byDayString = '';
      for (let day of event.recurrenceRule.byDay) {
        byDayString = byDayString + day + ',';
      }
      rruleString = rruleString + 'BYDAY=' + byDayString.substring(0, byDayString.length - 1) +';';
    }

    if (event.recurrenceRule.byWeekDayInMonth && event.recurrenceRule.byWeekDayInMonth.length > 0) {
      let byWeekDayInMonthString = '';
      for (let day of event.recurrenceRule.byWeekDayInMonth) {
        byWeekDayInMonthString = byWeekDayInMonthString + day + ',';
      }
      rruleString = rruleString + 'BYDAY=' + byWeekDayInMonthString.substring(0, byWeekDayInMonthString.length - 1) +';';
    }

    if (event.recurrenceRule.byMonthDay && event.recurrenceRule.byMonthDay.length > 0) {
      let byMonthDayString = '';
      for (let day of event.recurrenceRule.byMonthDay) {
        byMonthDayString = byMonthDayString + day + ',';
      }
      rruleString = rruleString + 'BYMONTHDAY=' + byMonthDayString.substring(0, byMonthDayString.length - 1) +';';
    }

    if (event.recurrenceRule.untilDateTime) {
      rruleString = rruleString + 'UNTIL=' + new Date(event.recurrenceRule.untilDateTime).toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0] + ';';
    }

    if (event.recurrenceRule.occurrences) {
      rruleString = rruleString + 'COUNT=' + event.recurrenceRule.occurrences + ';';
    }

    rruleString = rruleString + 'DTSTART=' + new Date(event.startDateTime).toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0] + ';';

    const rrule = RRule.fromString(
      rruleString.substring(0, rruleString.length - 1)
    );

    let tStart = new Date(startDateTime);
    let tEnd = new Date(endDateTime);

    let dates = rrule.between(
      datetime(
        tStart.getUTCFullYear(),
        tStart.getUTCMonth() + 1,
        tStart.getUTCDate()
      ),
      datetime(tEnd.getUTCFullYear(), tEnd.getUTCMonth() + 1, tEnd.getUTCDate())
    );

    if (!dates.includes(event.startDateTime)) {
      dates.push(event.startDateTime);
    }

    for (let date of dates) {
      let foundException = false;
      eventExceptions.forEach(function(eventException) {
        if (eventException.eventID == event._id.toString(), new Date(eventException.startDateTime).toISOString() == new Date(date).toISOString()) {
          foundException = true;
        }
      })

      if (foundException == false) {
        let startDateTimeTemp = dayjs(event.startDateTime);
        let endDateTimeTemp = dayjs(event.endDateTime);
        let timeBetweenStartAndEnd = endDateTimeTemp.diff(startDateTimeTemp);

        let endDateTime = dayjs(date).add(timeBetweenStartAndEnd, 'millisecond');
        let eventInstance = {
          _id: event._id,
          isInstance: true,

          scheduleID: event.scheduleID,
          title: event.title,
          description: event.description,
          location: event.location,
          timeZone: event.timeZone,
          startDateTime: date, //adjust for new date
          endDateTime: endDateTime.toISOString(), //adjust for new date
          recurrenceRule: event.recurrenceRule,
          maxAttendees: event.maxAttendees
        }
        eventInstances.push(eventInstance);
      }
      foundException = false;
    }
  }
  return eventInstances;
}

exports.getEventsOnSchedule = catchAsync(async (req, res, next) => {
  let eventQuery = {
    scheduleID: req.params.id,
    startDateTime: {
      $gte: new Date(req.query.startDateTime).toISOString(),
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
    endDateTime: {
      $gte: new Date(req.query.startDateTime).toISOString(),
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
    recurrenceRule: {
      $exists: false
    }
  };

  const events = await Event.find(eventQuery);

  let recurringEventQuery = {
    scheduleID: req.params.id,
    startDateTime: {
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
    // 'recurrenceRule.untilDateTime': {
    //   $gte: new Date(req.query.startDateTime).toISOString(),
    // },

    recurrenceRule: {
      $exists: true
    }
  }

  const recurringEvents = await Event.find(recurringEventQuery);

  let eventExceptionQuery = {
    scheduleID: req.params.id,
    startDateTime: {
      $gte: new Date(req.query.startDateTime).toISOString(),
      $lte: new Date(req.query.endDateTime).toISOString(),
    }
  };

  const recurringEventExceptions = await EventException.find(eventExceptionQuery);

  let recurringEventInstances = findInstancesInRange(recurringEvents, recurringEventExceptions, req.query.startDateTime, req.query.endDateTime);
  recurringEventInstances.forEach(function (eventInstance) {
    events.push(eventInstance);
  })

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

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,
  };

  let newEvent = await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success'
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  let updatedEvent = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    timeZone: req.body.timeZone,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,
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
    status: 'success'
  });
});

exports.updateThisEvent = catchAsync(async (req, res, next) => {
  let eventExceptionToCreate = {
    scheduleID: req.body.scheduleID,
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
    maxAttendees: req.body.maxAttendees,
  }
  let newEvent = await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success'
  });
});

exports.updateThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  const currentEvent = await Event.findById(req.params.id);

  currentEvent.recurrenceRule.untilDateTime = untilDate;

  const updatedCurrentEvent = await Event.findByIdAndUpdate(
    req.params.id,
    currentEvent,
    {
      new: true,
      runValidators: true,
    });

  let eventToCreate = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,
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
    status: 'success'
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

    recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,
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
    status: 'success'
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
    status: 'success'
  });
});

exports.deleteThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  const currentEvent = await Event.findById(req.params.id);

  currentEvent.recurrenceRule.untilDateTime = untilDate;

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    currentEvent,
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
    status: 'success'
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