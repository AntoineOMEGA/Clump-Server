const Schedule = require('../models/scheduleModel');
const ScheduleCategories = require('../models/scheduleCategoryModel');
const Member = require('../models/memberModel');
const Role = require('../models/roleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Clump = require('../models/clumpModel');
const Event = require('../models/eventModel');
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
  })

  const eventTemplates = await EventTemplate.find({
    clumpID: req.cookies.currentClumpID,
  })

  let eventQuery = { startDateTime: { $gte: new Date(req.query.startDate).toISOString().replace('Z', '+00:00'), $lt: new Date(req.query.endDate).toISOString().replace('Z', '+00:00')} }
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

copyGoogleCalendar = async (googleCalendarID, req, pageToken, gCalendar, scheduleID, startDate, endDate) => {

  console.log(startDate);
  console.log(endDate);
  let adjustedEndDate = new Date(endDate);
  adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
  console.log(new Date(startDate).toISOString());
  console.log(adjustedEndDate.toISOString());

  let calendarQuery = {
    calendarId: googleCalendarID,
    timeMin: new Date(startDate).toISOString(),
    timeMax: adjustedEndDate.toISOString(),
    maxResults: 2500,
    singleEvents: true,
    orderBy: 'startTime',
  }

  if (pageToken != 0) {
    calendarQuery.pageToken = pageToken;
  } else if (pageToken === undefined) {
    return
  }

  let result = await gCalendar.events.list(calendarQuery);
  let events = result.data.items;
  let eventTemplates = await EventTemplate.find({ clumpID: req.cookies.currentClumpID });


  for await (let event of events) {
    let newEvent = {
      title: event.summary,
      googleEventID: event.id,
      description: event.description,
      location: event.location,
      startDateTime: new Date(event.start.dateTime),
      endDateTime: new Date(event.end.dateTime),
      scheduleID: scheduleID,
    };

    //Some Error Here
    eventTemplates.forEach(function (eventTemplate) {
      if (event.summary.includes(eventTemplate.title)) {
        newEvent.eventTemplateID = eventTemplate._id;
      }
    })

    await Event.create(newEvent);
  }
  return result.nextPageToken;
}



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
  let syncCalendar = false;
  if (googleCalendarID) {
    const existingGoogleCalendar = await gCalendar.calendars.get({
      calendarId: googleCalendarID,
    });
    googleCalendarTitle = existingGoogleCalendar.data.summary;
    syncCalendar = true;

    let acl = await gCalendar.acl.list({
      calendarId: googleCalendarID
    });
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
    });

    if (syncCalendar) {
      copyGoogleCalendar(googleCalendarID, req, 0, gCalendar, newSchedule._id, req.body.startDate, req.body.endDate);
    }


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
  };

  const schedule = await Schedule.findByIdAndUpdate(req.params.id, updatedSchedule, {
    new: true,
    runValidators: true,
  });

  //ONLY UPDATE GOOGLE CALENDAR IF THE INFO FOR IT HAS CHANGED
  const refreshToken = await Clump.findById(req.cookies.currentClumpID);
  oAuth2Client.setCredentials({
    refresh_token: refreshToken.googleToken,
  });

  const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const updatedCalendar = {
    summary: schedule.title,
  };

  gCalendar.calendars.update({ calendarId: schedule.googleCalendarID, resource: updatedCalendar });

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
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, deletedSchedule, {
    new: true,
    runValidators: true,
  });

  if (!schedule) {
    return next(new AppError('No schedule found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});
