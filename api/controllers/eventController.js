const Event = require('../models/eventModel');
const EventException = require('../models/eventExceptionModel');
const EventAttendee = require('../models/eventAttendeeModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
