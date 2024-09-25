const Event = require('../models/eventModel');
const EventException = require('../models/eventExceptionModel');
const EventAttendee = require('../models/eventAttendeeModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;
const datetime = RRuleLib.datetime;
const dayjs = require('dayjs');

exports.getEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({ scheduleID: req.body.scheduleID });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

const findInstancesInRange = (
  eventStartDateTime,
  eventEndDateTime,
  recurrenceRule,
  rangeStartDateTime,
  rangeEndDateTime
) => {
  let rruleString;
  if (
    recurrenceRule.frequency == 'Daily' ||
    recurrenceRule.frequency == 'Weekly'
  ) {
    rruleString = 'FREQ=' + recurrenceRule.frequency + ';';
  } else if (
    recurrenceRule.frequency == 'Monthly by day' ||
    recurrenceRule.frequency == 'Monthly by date'
  ) {
    rruleString = 'FREQ=MONTHLY;';
  } else if (
    recurrenceRule.frequency == 'Yearly by day' ||
    recurrenceRule.frequency == 'Yearly by date'
  ) {
    rruleString = 'FREQ=YEARLY;';
  }

  if (recurrenceRule.interval) {
    rruleString = rruleString + 'INTERVAL=' + recurrenceRule.interval + ';';
  }

  if (recurrenceRule.byMonth) {
    rruleString = rruleString + 'BYMONTH=' + recurrenceRule.byMonth + ';';
  }

  if (recurrenceRule.byDay && recurrenceRule.byDay.length > 0) {
    let byDayString = '';
    for (let day of recurrenceRule.byDay) {
      byDayString = byDayString + day + ',';
    }
    rruleString =
      rruleString +
      'BYDAY=' +
      byDayString.substring(0, byDayString.length - 1) +
      ';';
  }

  if (
    recurrenceRule.byWeekDayInMonth &&
    recurrenceRule.byWeekDayInMonth.length > 0
  ) {
    let byWeekDayInMonthString = '';
    for (let day of recurrenceRule.byWeekDayInMonth) {
      byWeekDayInMonthString = byWeekDayInMonthString + day + ',';
    }
    rruleString =
      rruleString +
      'BYDAY=' +
      byWeekDayInMonthString.substring(0, byWeekDayInMonthString.length - 1) +
      ';';
  }

  if (recurrenceRule.byMonthDay && recurrenceRule.byMonthDay.length > 0) {
    let byMonthDayString = '';
    for (let day of recurrenceRule.byMonthDay) {
      byMonthDayString = byMonthDayString + day + ',';
    }
    rruleString =
      rruleString +
      'BYMONTHDAY=' +
      byMonthDayString.substring(0, byMonthDayString.length - 1) +
      ';';
  }

  if (recurrenceRule.untilDateTime) {
    rruleString =
      rruleString +
      'UNTIL=' +
      new Date(recurrenceRule.untilDateTime)
        .toISOString()
        .replaceAll('-', '')
        .replaceAll(':', '')
        .split('.')[0] +
      ';';
  }

  if (recurrenceRule.occurrences) {
    rruleString = rruleString + 'COUNT=' + recurrenceRule.occurrences + ';';
  }

  rruleString =
    rruleString +
    'DTSTART=' +
    new Date(eventStartDateTime)
      .toISOString()
      .replaceAll('-', '')
      .replaceAll(':', '')
      .split('.')[0] +
    ';';

  const rrule = RRule.fromString(
    rruleString.substring(0, rruleString.length - 1)
  );

  let tStart = new Date(rangeStartDateTime);
  let tEnd = new Date(rangeEndDateTime);

  let dates = rrule.between(
    datetime(
      tStart.getUTCFullYear(),
      tStart.getUTCMonth() + 1,
      tStart.getUTCDate()
    ),
    datetime(tEnd.getUTCFullYear(), tEnd.getUTCMonth() + 1, tEnd.getUTCDate())
  );

  //ADD Original Start Date Time to Instances (compatibility with ICal calendars elsewhere)
  if (
    eventEndDateTime >= new Date(rangeStartDateTime) &&
    eventStartDateTime <= new Date(rangeEndDateTime)
  ) {
    let found = false;
    for (let date of dates) {
      if (
        date.toISOString() ==
        eventStartDateTime.toISOString().split('.')[0] + '.000Z'
      ) {
        found = true;
      }
    }

    if (!found) {
      let originDate = eventStartDateTime;
      dates.unshift(
        new Date(eventStartDateTime.toISOString().split('.')[0] + '.000Z')
      );
    }
  }

  return dates;
};

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
      $exists: false,
    },
  };

  const events = await Event.find(eventQuery);

  let recurringEventQuery = {
    scheduleID: req.params.id,
    startDateTime: {
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
    recurrenceRule: {
      $exists: true,
    },
  };

  const recurringEvents = await Event.find(recurringEventQuery);

  let eventExceptionQuery = {
    scheduleID: req.params.id,
    startDateTime: {
      $gte: new Date(req.query.startDateTime).toISOString(),
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
  };

  const recurringEventExceptions = await EventException.find(
    eventExceptionQuery
  );

  let eventAttendeeEventIDArray = [];
  for (let event of events) {
    if (!eventAttendeeEventIDArray.includes(event._id)) {
      eventAttendeeEventIDArray.push(event._id);
    }
  }
  for (let event of recurringEvents) {
    if (!eventAttendeeEventIDArray.includes(event._id)) {
      eventAttendeeEventIDArray.push(event._id);
    }
  }

  let eventAttendeeQuery = {
    eventID: {
      $in: eventAttendeeEventIDArray,
    },
    startDateTime: {
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
  };

  const eventAttendees = await EventAttendee.find(eventAttendeeQuery);


  let eventAttendeeIDArray = [];
  for (let attendee of eventAttendees) {
    if (!eventAttendeeIDArray.includes(attendee._id)) {
      eventAttendeeIDArray.push(attendee._id);
    }
  }

  let eventAttendeeExceptionQuery = {
    eventAttendeeID: {
      $in: eventAttendeeIDArray
    },
    startDateTime: {
      $gte: new Date(req.query.startDateTime).toISOString(),
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
  };

  const eventAttendeeExceptions = await EventException.find(eventAttendeeExceptionQuery);

  for (let event of recurringEvents) {
    let dates = findInstancesInRange(
      event.startDateTime,
      event.endDateTime,
      event.recurrenceRule,
      req.query.startDateTime,
      req.query.endDateTime
    );

    for (let date of dates) {
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
        startDateTime: date.toISOString(), //adjust for new date
        endDateTime: endDateTime.toISOString(), //adjust for new date
        recurrenceRule: event.recurrenceRule,
        maxAttendees: event.maxAttendees,

        attendees: [],
      };

      recurringEventExceptions.forEach(function (eventException) {
        if (
          (eventException.eventID == event._id.toString(),
          new Date(eventException.startDateTime).toISOString() ==
            new Date(date).toISOString())
        ) {
          eventInstance.status = 'cancelled';
        }
      });

      eventAttendees.forEach(function (attendee) {
        if (attendee.eventID.toString() == event._id.toString()) {
          if (
            new Date(attendee.startDateTime).toISOString() ==
            new Date(date).toISOString()
          ) {
            let eventAttendeeObject = {
              attendeeID: attendee._id,
              //TODO: Figure out if I need different for INSTANCES
              startDateTime: attendee.startDateTime,
              endDateTime: attendee.endDateTime,
              untilDateTime: attendee.untilDateTime
            }
            eventInstance.attendees.push(attendee._id);

            eventAttendeeExceptions.forEach(function (eventAttendeeException) {
              if (
                (eventAttendeeException.eventID == event._id.toString(),
                new Date(eventAttendeeException.startDateTime).toISOString() ==
                  new Date(date).toISOString())
              ) {
                eventAttendeeObject.status = 'cancelled';
              }
            });
          }
        }
      });

      events.push(eventInstance);
    }
  }

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

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
  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let eventToCreate = {
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

  await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success',
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);
  if (
    new Date(req.body.modifiedDateTime) <
    new Date(currentEvent.modifiedDateTime)
  ) {
    return next(
      new AppError(
        'Failed. This update has been modified and you must refresh before updating it again.',
        404
      )
    );
  }

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date.', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date.', 404));
  }

  let updatedEvent = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    timeZone: req.body.timeZone,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    //recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,

    modifiedDateTime: new Date(),
  };

  const event = await Event.findByIdAndUpdate(req.params.id, updatedEvent, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.updateThisEvent = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);
  if (
    new Date(req.body.modifiedDateTime) <
    new Date(currentEvent.modifiedDateTime)
  ) {
    return next(
      new AppError(
        'Failed. This update has been modified and you must refresh before updating it again.',
        404
      )
    );
  }

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let eventExceptionToCreate = {
    scheduleID: req.body.scheduleID,
    eventID: req.params.id,
    startDateTime: req.body.startDateTime,
  };
  let newEventException = await EventException.create(eventExceptionToCreate);

  let eventToCreate = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),
    maxAttendees: req.body.maxAttendees,
  };
  let newEvent = await Event.create(eventToCreate);

  res.status(201).json({
    status: 'success',
  });
});

exports.updateThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  let currentEvent = await Event.findById(req.params.id);
  if (
    new Date(req.body.modifiedDateTime) <
    new Date(currentEvent.modifiedDateTime)
  ) {
    return next(
      new AppError(
        'Failed. This update has been modified and you must refresh before updating it again.',
        404
      )
    );
  }

  currentEvent.recurrenceRule.untilDateTime = untilDate;

  const updatedCurrentEvent = await Event.findByIdAndUpdate(
    req.params.id,
    currentEvent,
    {
      new: true,
      runValidators: true,
    }
  );

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

  let eventToCreate = {
    scheduleID: req.body.scheduleID,

    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    timeZone: req.body.timeZone,

    startDateTime: new Date(req.body.startDateTime),
    endDateTime: new Date(req.body.endDateTime),

    recurrenceRule: req.body.recurrenceRule,
    maxAttendees: req.body.maxAttendees,

    modifiedDateTime: new Date(),
  };
  let newEvent = await Event.create(eventToCreate);

  let eventExceptions;

  if (
    new Date(currentEvent.startDateTime).getDay() !=
    new Date(eventToCreate.startDateTime).getDay()
  ) {
    eventExceptions = await EventException.deleteMany({
      eventID: { $eq: req.params.id },
    });
  } else {
    eventExceptions = await EventException.updateMany(
      {
        $and: [
          { eventID: { $eq: req.params.id } },
          { startDateTime: { $gte: req.body.startDateTime } },
        ],
      },
      { eventID: newEvent._id },
      function (err, eventExceptions) {
        if (err) {
          return next(new AppError('Issue updating Event Exceptions', 400));
        }
      }
    );
  }

  res.status(201).json({
    status: 'success',
  });
});

exports.updateAllEvents = catchAsync(async (req, res, next) => {
  let currentEvent = await Event.findById(req.params.id);
  if (
    new Date(req.body.modifiedDateTime) <
    new Date(currentEvent.modifiedDateTime)
  ) {
    return next(
      new AppError(
        'Failed. This update has been modified and you must refresh before updating it again.',
        404
      )
    );
  }

  if (req.body.endDateTime <= req.body.startDateTime) {
    return next(new AppError('End Date is not After Start Date', 404));
  }

  if (req.body.untilDateTime <= req.body.endDateTime) {
    return next(new AppError('Until Date is not After End Date', 404));
  }

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

    modifiedDateTime: new Date(),
  };

  const event = await Event.findByIdAndUpdate(req.params.id, updatedEvent, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  if (
    new Date(currentEvent.startDateTime).getDay() !=
    new Date(event.startDateTime).getDay()
  ) {
    const eventExceptions = await EventException.deleteMany({
      eventID: { $eq: req.params.id },
    });
  }

  res.status(200).json({
    status: 'success',
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
    startDateTime: req.body.startDateTime,
  };
  let eventException = await EventException.create(eventExceptionToCreate);

  res.status(201).json({
    status: 'success',
  });
});

exports.deleteThisAndFollowingEvents = catchAsync(async (req, res, next) => {
  let untilDate = new Date(req.body.startDateTime);
  untilDate.setDate(untilDate.getDate() - 1);

  const currentEvent = await Event.findById(req.params.id);

  currentEvent.recurrenceRule.untilDateTime = untilDate;

  const event = await Event.findByIdAndUpdate(req.params.id, currentEvent, {
    new: true,
    runValidators: true,
  });

  let eventExceptions = await EventException.deleteMany({
    $and: [
      { eventID: { $eq: req.params.id } },
      { startDateTime: { $gte: req.body.startDateTime } },
    ],
  });

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.deleteAllEvents = catchAsync(async (req, res, next) => {
  const event = await Event.deleteOne({ _id: req.params.id });
  const eventExceptions = await EventException.deleteMany({
    eventID: { $eq: req.params.id },
  });

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(204).send();
});
