const Schedule = require('../models/scheduleModel');
const ScheduleCategories = require('../models/scheduleCategoryModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Clump = require('../models/clumpModel');
const Event = require('../models/eventModel');
const RecurringEvent = require('../models/recurringEventModel');
const EventTemplate = require('../models/eventTemplateModel');

const { google } = require('googleapis');

const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
  process.env.OAUTH_ID,
  process.env.OAUTH_SECRET,
  process.env.OAUTH_REDIRECT_URL
);

exports.getSchedules = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({
    clumpID: req.cookies.currentClumpID,
    active: true,
  });

  res.status(200).json({
    status: 'success',
    results: schedules.length,
    data: {
      schedules: schedules,
    },
  });
});

exports.getSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.find({
    _id: req.params.id,
    clumpID: req.cookies.currentClumpID,
  });

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      eventTemplate,
    },
  });
});

exports.aliasCombineSchedules = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({
    clumpID: req.cookies.currentClumpID,
    active: true,
  });

  const scheduleCategories = await ScheduleCategories.find({
    clumpID: req.cookies.currentClumpID,
  });

  const eventTemplates = await EventTemplate.find({
    clumpID: req.cookies.currentClumpID,
  });

  let eventQuery = {
    startDateTime: {
      $gte: new Date(req.query.startDate).toISOString().replace('Z', '+00:00'),
      $lt: new Date(req.query.endDate).toISOString().replace('Z', '+00:00'),
    },
    eventTemplateID: {
      $exists: true,
    },
  };
  /*
  for (let eventTemplate of eventTemplates) {
    eventQuery.$or.push({eventTemplateID: eventTemplate._id});
  }
*/
  const events = await Event.find(eventQuery);

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      scheduleCategories: scheduleCategories,
      schedules: schedules,
      eventTemplates: eventTemplates,
      events: events,
    },
  });
});

syncCalendar = async (gCalendar, schedule, fullSync) => {
  if (fullSync) {
    await Event.deleteMany({ scheduleID: schedule._id });
    await RecurringEvent.deleteMany({ scheduleID: schedule._id });
    await copyGoogleCalendar(0, gCalendar, schedule, false);
  } else {
    await copyGoogleCalendar(0, gCalendar, schedule, true);
  }
};

copyGoogleCalendar = async (
  pageToken,
  gCalendar,
  schedule,
  incrementalSync
) => {
  let calendarQuery = {
    calendarId: schedule.googleCalendarID,
    maxResults: 2500,
    singleEvents: true,
  };

  if (incrementalSync) {
    calendarQuery.syncToken = schedule.nextSyncToken;
  }

  if (pageToken != 0) {
    calendarQuery.pageToken = pageToken;
  } else if (pageToken === undefined) {
    return;
  }

  let result = await gCalendar.events.list(calendarQuery);
  let events = result.data.items;
  let eventTemplates = await EventTemplate.find({
    clumpID: schedule.clumpID,
  });

  let recurringEventIDs = [];

  for await (let event of events) {
    if (!incrementalSync) {
      if (event.status == 'confirmed') {
        let newEvent = {
          title: event.summary,
          googleEventID: event.id,
          description: event.description,
          location: event.location,
          startDateTime: new Date(event.start.dateTime),
          endDateTime: new Date(event.end.dateTime),
          scheduleID: schedule._id,
          clumpID: schedule.clumpID,
        };

        if (
          'recurringEventId' in event &&
          !recurringEventIDs.includes(event.recurringEventId)
        ) {
          recurringEventIDs.push(event.recurringEventId);
        }

        //Some Error Here
        eventTemplates.forEach(function (eventTemplate) {
          if (event.summary.includes(eventTemplate.title)) {
            newEvent.eventTemplateID = eventTemplate._id;
          }
        });

        try {
          await Event.create(newEvent);
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      let existingEvent = await Event.find({ googleEventID: event.id });
      if (event.status == 'confirmed') {
        let newEvent = {
          title: event.summary,
          googleEventID: event.id,
          description: event.description,
          location: event.location,
          startDateTime: new Date(event.start.dateTime),
          endDateTime: new Date(event.end.dateTime),
          scheduleID: schedule._id,
          clumpID: schedule.clumpID,
        };

        if ('recurringEventId' in event && !recurringEventIDs.includes(event.recurringEventId)) {
          let existingRecurringEvent = await RecurringEvent.find({
            googleRecurringEventID: event.recurringEventId,
          });
          if (existingRecurringEvent.length == 0) {
            recurringEventIDs.push(event.recurringEventId);
          }
        }

        

        //Some Error Here
        eventTemplates.forEach(function (eventTemplate) {
          if (event.summary.includes(eventTemplate.title)) {
            newEvent.eventTemplateID = eventTemplate._id;
          }
        });

        try {
          if (existingEvent.length == 0) {
            await Event.create(newEvent);
          } else {
            await Event.findOneAndUpdate({ googleEventID: event.id }, newEvent);
          }
        } catch (err) {
          console.log(err);
        }
      } else if (event.status == 'cancelled') {
        await Event.findOneAndDelete({ googleEventID: event.id });
      }
    }
  }

  for await (let recurringEventId of recurringEventIDs) {
    let recurringEvent = await gCalendar.events.get({
      calendarId: schedule.googleCalendarID,
      eventId: recurringEventId,
    });

    RecurringEvent.create({
      clumpID: schedule.clumpID,
      scheduleID: schedule._id,
      googleRecurringEventID: recurringEventId,
      recurrence: recurringEvent.data.recurrence[0],
    });
  }

  if (result.data.nextPageToken != null) {
    copyGoogleCalendar(
      result.data.nextPageToken,
      gCalendar,
      schedule,
      incrementalSync
    );
  } else {
    await Schedule.findByIdAndUpdate(schedule._id, {
      nextSyncToken: result.data.nextSyncToken,
      lastSync: new Date(),
    });
  }
};

exports.aliasSyncSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id);

  //ONLY UPDATE GOOGLE CALENDAR IF THE INFO FOR IT HAS CHANGED
  const refreshToken = await Clump.findById(req.cookies.currentClumpID);
  oAuth2Client.setCredentials({
    refresh_token: refreshToken.googleToken,
  });

  const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  await syncCalendar(gCalendar, schedule, false);

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
  });
});

exports.createSchedule = catchAsync(async (req, res, next) => {
  const member = await Member.findOne({
    userID: req.cookies.currentUserID,
    clumpID: req.cookies.currentClumpID,
  });
  const role = await Role.findOne({ _id: member.roleID });
  let newSchedule;
  let newGoogleCalendar;
  let googleCalendarID = req.body.googleCalendarID;
  let googleCalendarTitle = req.body.title;

  const refreshToken = await Clump.findById(req.cookies.currentClumpID);
  oAuth2Client.setCredentials({
    refresh_token: refreshToken.googleToken,
  });

  const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  if (googleCalendarID) {
    const existingGoogleCalendar = await gCalendar.calendars.get({
      calendarId: googleCalendarID,
    });
    googleCalendarTitle = existingGoogleCalendar.data.summary;
  }

  if (!googleCalendarID) {
    const newCalendar = {
      summary: googleCalendarTitle,
      timeZone: 'America/Denver',
    };

    newGoogleCalendar = await gCalendar.calendars.insert({
      resource: newCalendar,
    });
    googleCalendarID = newGoogleCalendar.data.id;
  }

  if (role.canCreateSchedules) {
    newSchedule = await Schedule.create({
      title: googleCalendarTitle,
      scheduleCategoryID: req.body.scheduleCategoryID,
      clumpID: req.cookies.currentClumpID,
      googleCalendarID: googleCalendarID,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      comments: req.body.comments,
    });

    syncCalendar(gCalendar, newSchedule, false);

    // and propogate permissions to self and above roles

    role.canViewSchedules.push(newSchedule._id);
    role.canEditSchedules.push(newSchedule._id);
    await role.save();

    let parentRoleID = role.parentRole;
    while (parentRoleID !== undefined) {
      let parentRole = await Role.findOne({ _id: parentRoleID });
      parentRole.canViewSchedules.push(newSchedule._id);
      parentRole.canEditSchedules.push(newSchedule._id);
      await parentRole.save();
    }
  } else {
    return next(
      new AppError('You are not authorized to Create Event Templates', 401)
    );
  }

  res.status(201).json({
    status: 'success',
    data: {
      schedule: newSchedule,
    },
  });
});

exports.updateSchedule = catchAsync(async (req, res, next) => {
  let updatedSchedule = {
    title: req.body.title,
    scheduleCategoryID: req.body.scheduleCategoryID,
    comments: req.body.comments,
  };

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    updatedSchedule,
    {
      new: true,
      runValidators: true,
    }
  );

  //ONLY UPDATE GOOGLE CALENDAR IF THE INFO FOR IT HAS CHANGED
  const refreshToken = await Clump.findById(req.cookies.currentClumpID);
  oAuth2Client.setCredentials({
    refresh_token: refreshToken.googleToken,
  });

  const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const updatedCalendar = {
    summary: schedule.title,
  };

  gCalendar.calendars.update({
    calendarId: schedule.googleCalendarID,
    resource: updatedCalendar,
  });

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      schedule,
    },
  });
});

exports.deleteSchedule = catchAsync(async (req, res, next) => {
  let deletedSchedule = {
    active: false,
  };
  //Needs Google Integration ???
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    deletedSchedule,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
