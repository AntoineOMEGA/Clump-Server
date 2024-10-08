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
  //Get All Events Owned by the ScheduleID(req.params.id)
  let eventQuery = {
    scheduleID: req.params.id,
    $or: [
      //SINGLE EVENTS
      {
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
      },
      //RECURRING EVENTS
      //TODO: Add $cond to filter results out of date range when possible
      {
        startDateTime: {
          $lte: new Date(req.query.endDateTime).toISOString(),
        },
        recurrenceRule: {
          $exists: true,
        },
      },
    ],
  };

  let events = await Event.find(eventQuery);

  //Get Attendees attending Events Owned by the ScheduleID(req.params.id)
  let eventIDs = [];
  for (let event of events) {
    if (!eventIDs.includes(event._id)) {
      eventIDs.push(event._id);
    }
  }
  let attendeeQuery = {
    /*eventAttendeeID: {
      $in: eventAttendeeIDArray,
    },*/
    $or: [
      //SINGLE EVENTS
      {
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
      },
      //RECURRING EVENTS
      //TODO: Add $cond to filter results out of date range when possible
      {
        startDateTime: {
          $lte: new Date(req.query.endDateTime).toISOString(),
        },
        recurrenceRule: {
          $exists: true,
        },
      },
    ],
  };
  let attendees = await EventAttendee.find(attendeeQuery);

  //Get All Attendees where ScheduleID(req.params.id) attends another Schedule's event
  let attendantQuery = {
    scheduleID: req.params.id,
    $or: [
      //SINGLE EVENTS
      {
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
      },
      //RECURRING EVENTS
      //TODO: Add $cond to filter results out of date range when possible
      {
        startDateTime: {
          $lte: new Date(req.query.endDateTime).toISOString(),
        },
        recurrenceRule: {
          $exists: true,
        },
      },
    ],
  };
  let attendeesOfOtherSchedules = await EventAttendee.find(attendantQuery);

  //Get All Events that ScheduleID(req.params.id) is attending
  let attendingEventIDs = [];
  for (let attendee of attendeesOfOtherSchedules) {
    if (!attendingEventIDs.includes(attendee.eventID)) {
      attendingEventIDs.push(attendee.eventID);
    }
  }
  let attendingEventsQuery = {
    _id: {
      $in: attendingEventIDs,
    },
    //DO NOT NEED TO SPECIFY DATES
    //The Attendee Query did this and it can be assumed that this query will only get relevant events
  };
  let attendingEvents = await Event.find(attendingEventsQuery);

  //Get All Event Exceptions for Recurring Events & Recurring Event Attendees
  let eventExceptionQuery = {
    $or: [
      //Gets Exceptions for Events this Schedule Owns and for Events this Schedule Attends
      {
        scheduleID: req.params.id,
      },
      //Gets Exceptions for Attendees that Attend Events owned by this Schedule
      {
        eventID: {
          $in: attendingEventIDs,
        },
      },
    ],
    startDateTime: {
      $gte: new Date(req.query.startDateTime).toISOString(),
      $lte: new Date(req.query.endDateTime).toISOString(),
    },
  };
  let eventExceptions = await EventException.find(eventExceptionQuery);

  //Refined Results
  //Go through ALL the requested Data and Prepare it for Client's Display
  let refinedEvents = [];

  for (let event of events) {
    if (event.recurrenceRule) {
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

        let endDateTime = dayjs(date).add(
          timeBetweenStartAndEnd,
          'millisecond'
        );
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

        eventExceptions.forEach(function (eventException) {
          if (
            (eventException.eventID == event._id.toString(),
            new Date(eventException.startDateTime).toISOString() ==
              new Date(date).toISOString())
          ) {
            eventInstance.status = 'cancelled';
            eventInstance.exception = eventException._id;
          }
        });

        attendees.forEach(function (attendee) {
          if (attendee.eventID.toString() == event._id.toString()) {
            let attendeeDateRangeParameters = {};

            if (attendee.startDateTime) {
              attendeeDateRangeParameters.startDateTime =
                attendee.startDateTime;
            } else {
              attendeeDateRangeParameters.startDateTime = event.startDateTime;
            }

            if (attendee.endDateTime) {
              attendeeDateRangeParameters.endDateTime = attendee.endDateTime;
            } else {
              attendeeDateRangeParameters.endDateTime = event.endDateTime;
            }

            attendeeDateRangeParameters.recurrenceRule = event.recurrenceRule;
            if (attendee.recurrenceRule.untilDateTime) {
              attendeeDateRangeParameters.recurrenceRule.untilDateTime =
                attendee.recurrenceRule.untilDateTime;
            }
            if (attendee.recurrenceRule.occurrences) {
              attendeeDateRangeParameters.recurrenceRule.occurrences =
                attendee.recurrenceRule.occurrences;
            }

            let attendeeDates = findInstancesInRange(
              attendeeDateRangeParameters.startDateTime,
              attendeeDateRangeParameters.endDateTime,
              attendeeDateRangeParameters.recurrenceRule,
              req.query.startDateTime,
              req.query.endDateTime
            );

            for (let attendeeDate of attendeeDates) {
              if (attendeeDate >= date && attendeeDate <= endDateTime) {
                let startDateTimeTemp = dayjs(event.startDateTime);
                let endDateTimeTemp = dayjs(event.endDateTime);
                let timeBetweenStartAndEnd =
                  endDateTimeTemp.diff(startDateTimeTemp);

                let endDateTime = dayjs(date).add(
                  timeBetweenStartAndEnd,
                  'millisecond'
                );

                let eventAttendeeObject = {
                  scheduleID: attendee.scheduleID,
                  attendeeID: attendee._id,
                  startDateTime: date.toISOString(),
                  endDateTime: endDateTime.toISOString(),
                  untilDateTime: attendee.untilDateTime,
                };
                eventInstance.attendees.push(eventAttendeeObject);

                eventExceptions.forEach(function (eventAttendeeException) {
                  if (
                    (eventAttendeeException.eventID == event._id.toString(),
                    new Date(
                      eventAttendeeException.startDateTime
                    ).toISOString() == new Date(date).toISOString())
                  ) {
                    eventAttendeeObject.status = 'cancelled';
                    eventAttendeeObject.exception = eventException._id;
                  }
                });
              }
            }
          }
        });
        refinedEvents.push(eventInstance);
      }
    } else {
      if (event.endDateTime >= new Date(req.query.startDateTime) && event.startDateTime <= new Date(req.query.endDateTime)) {
        console.log(event);
        let eventInstance = {
          _id: event._id,
          isInstance: false,

          scheduleID: event.scheduleID,
          title: event.title,
          description: event.description,
          location: event.location,
          timeZone: event.timeZone,
          startDateTime: event.startDateTime, //adjust for new date
          endDateTime: event.endDateTime, //adjust for new date
          maxAttendees: event.maxAttendees,

          attendees: [],
        };

        attendees.forEach(function (attendee) {
          //TODO: No attendee date validation
          if (attendee.eventID.toString() == event._id.toString()) {
            let eventAttendeeObject = {
              scheduleID: attendee.scheduleID,
              attendeeID: attendee._id,
              startDateTime: attendee.startDateTime,
              endDateTime: attendee.endDateTime,
              untilDateTime: attendee.untilDateTime,
            };
            eventInstance.attendees.push(eventAttendeeObject);
          }
        });

        refinedEvents.push(eventInstance);
      }
    }
  }

  for (let attendeeEvent of attendingEvents) {
    if (attendeeEvent.recurrenceRule) {
      let dates = findInstancesInRange(
        attendeeEvent.startDateTime,
        attendeeEvent.endDateTime,
        attendeeEvent.recurrenceRule,
        req.query.startDateTime,
        req.query.endDateTime
      );

      for (let date of dates) {
        let startDateTimeTemp = dayjs(attendeeEvent.startDateTime);
        let endDateTimeTemp = dayjs(attendeeEvent.endDateTime);
        let timeBetweenStartAndEnd = endDateTimeTemp.diff(startDateTimeTemp);

        let endDateTime = dayjs(date).add(
          timeBetweenStartAndEnd,
          'millisecond'
        );
        let attendeeEventInstance = {
          _id: attendeeEvent._id,
          isInstance: true,
          isAttending: true,

          scheduleID: attendeeEvent.scheduleID,
          title: attendeeEvent.title,
          description: attendeeEvent.description,
          location: attendeeEvent.location,
          timeZone: attendeeEvent.timeZone,
          startDateTime: date.toISOString(), //adjust for new date
          endDateTime: endDateTime.toISOString(), //adjust for new date
          recurrenceRule: attendeeEvent.recurrenceRule,
          maxAttendees: attendeeEvent.maxAttendees,

          attendees: [],
        };

        eventExceptions.forEach(function (eventException) {
          if (
            (eventException.eventID == attendeeEvent._id.toString(),
            new Date(eventException.startDateTime).toISOString() ==
              new Date(date).toISOString())
          ) {
            attendeeEventInstance.status = 'cancelled';
            attendeeEventInstance.exception = eventException._id;
          }
        });
        refinedEvents.push(attendeeEventInstance);
      }
    } else {
      let attendeeEventInstance = {
        _id: attendeeEvent._id,
        isAttending: true,

        scheduleID: attendeeEvent.scheduleID,
        title: attendeeEvent.title,
        description: attendeeEvent.description,
        location: attendeeEvent.location,
        timeZone: attendeeEvent.timeZone,
        startDateTime: attendeeEvent.startDateTime,
        endDateTime: attendeeEvent.endDateTime,
        maxAttendees: attendeeEvent.maxAttendees,
      };
      refinedEvents.push(attendeeEventInstance);
    }
  }

  res.status(200).json({
    status: 'success',
    results: refinedEvents.length,
    data: {
      events: refinedEvents,
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
