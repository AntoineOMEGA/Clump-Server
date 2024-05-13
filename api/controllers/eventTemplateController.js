const EventTemplate = require('../models/eventTemplateModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasCombineSchedules = catchAsync(async (req, res, next) => {

  const eventTemplates = await EventTemplate.find({
    clumpID: req.cookies.currentClumpID,
  });

  const shifts = await Shift.find({
    clumpID: req.cookies.currentClumpID,
  });

  let singleEventQuery = {
    startDateTime: {
      $gte: new Date(req.query.startDate).toISOString(),
      $lt: new Date(req.query.endDate).toISOString(),
    },
    eventTemplateID: {
      $equals: req.params.id,
    },
    until: {
      $exists: false,
    },
  };

  let recurringEventQuery = {
    startDateTime: {
      $lt: new Date(req.query.startDate).toISOString(),
    },
    until: {
      $gte: new Date(req.query.endDate).toISOString(),
    },
    eventTemplateID: {
      $equals: req.params.id,
    },
    until: {
      $exists: true,
    },
  };
  
  const events = await Event.find(singleEventQuery);
  const rEvents = await Event.find(recurringEventQuery);

  let fEvents = [];

  fEvents = events;

  for (let event of rEvents) {
    let rruleString = '';
    if (event.recurrence.frequency != 'Once') {
      rruleString = rruleString + 'FREQ=' + event.recurrence.frequency + ';';
    }

    if (event.recurrence.interval) {
      rruleString = rruleString + 'INTERVAL=' + event.recurrence.interval + ';';
    }

    if (event.recurrence.byMonth) {
      rruleString = rruleString + 'BYMONTH=' + event.recurrence.byMonth + ';';
    }

    if (event.recurrence.byDay && event.recurrence.byDay.length > 0) {
      let byDayString = '';
      for (let day of event.recurrence.byDay) {
        byDayString = byDayString + day + ',';
      }
      rruleString =
        rruleString +
        'BYDAY=' +
        byDayString.substring(0, byDayString.length - 1) +
        ';';
    }

    if (event.recurrence.byMonthDay && event.recurrence.byMonthDay.length > 0) {
      let byMonthDayString = '';
      for (let day of event.recurrence.byMonthDay) {
        byMonthDayString = byMonthDayString + day + ',';
      }
      rruleString =
        rruleString +
        'BYMONTHDAY=' +
        byMonthDayString.substring(0, byMonthDayString.length - 1) +
        ';';
    }

    if (event.until) {
      rruleString = rruleString + 'UNTIL=' + new Date(event.until).toISOString().replaceAll('-', '').replaceAll(':', '').replace('.000', '') + ';';
    }
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

    for (let date of dates) {
      fEvents.push(event);
    }
  }

  res.status(200).json({
    status: 'success',
    results: fEvents.length,
    data: {
      scheduleCategories: scheduleCategories,
      schedules: schedules,
      eventTemplates: eventTemplates,
      events: fEvents,
      shifts: shifts,
    },
  });
});

exports.getEventTemplates = catchAsync(async (req, res, next) => {
  const eventTemplates = await EventTemplate.find({clumpID: req.cookies.currentClumpID});

  res.status(200).json({
    status: 'success',
    results: eventTemplates.length,
    data: {
      eventTemplates: eventTemplates,
    },
  });
});

exports.getEventTemplate = catchAsync(async (req, res, next) => {
  const eventTemplate = await EventTemplate.find({_id: req.params.id, clumpID: req.cookies.currentClumpID});

  if (!eventTemplate) {
    return next(new AppError('No eventTemplate found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplate,
    },
  });
});

exports.createEventTemplate = catchAsync(async (req, res, next) => {
  //const member = await Member.findOne({userID: req.cookies.currentUserID, clumpID: req.cookies.currentClumpID});
  //const role = await Role.findOne({_id: member.roleID});
  let newEventTemplate;

  //if (role.canCreateEventTemplates) {
  if (true) {
    newEventTemplate = await EventTemplate.create({
      clumpID: req.cookies.currentClumpID,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      comments: req.body.comments
    });
    // and propogate permissions to self and above roles

    //role.canViewEventTemplates.push(newEventTemplate._id);
    //role.canEditEventTemplates.push(newEventTemplate._id);
    //await role.save();

    //let parentRoleID = role.parentRole;
    //while (parentRoleID !== undefined) {
      //let parentRole = await Role.findOne({_id: parentRoleID});
      //parentRole.canViewEventTemplates.push(newEventTemplate._id);
      //parentRole.canEditEventTemplates.push(newEventTemplate._id);
      //await parentRole.save();
    //}
  } else {
    return next(new AppError('You are not authorized to Create Event Templates', 401));
  }
  

  res.status(201).json({
    status: 'success',
    data: {
      eventTemplate: newEventTemplate,
    },
  });
});

exports.updateEventTemplate = catchAsync(async (req, res, next) => {
  let updatedEventTemplate = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    comments: req.body.comments
  };

  const eventTemplate = await EventTemplate.findByIdAndUpdate(
    req.params.id,
    updatedEventTemplate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!eventTemplate) {
    return next(new AppError('No eventTemplate found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplate,
    },
  });
});

exports.deleteEventTemplate = catchAsync(async (req, res, next) => {
  const eventTemplate = await EventTemplate.findByIdAndDelete(req.params.id);

  if (!eventTemplate) {
    return next(new AppError('No eventTemplate found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
