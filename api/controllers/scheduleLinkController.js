const ScheduleLink = require('../models/scheduleLinkModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel');
const EventException = require('../models/eventExceptionModel');
const sendEmail = require('./../utils/email');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;
const datetime = RRuleLib.datetime;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const ical = require('ical-generator');

exports.generateICal = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id);
  const calendar = new ical.ICalCalendar({ name: schedule.title });

  let eventQuery = {
    scheduleID: req.params.id
  };

  const events = await Event.find(eventQuery);

  for await (let event of events) {
    let tempEvent = calendar.createEvent({
      summary: event.title,
      description: event.description,
      location: event.location,
      timezone: event.timeZone,
      start: event.startDateTime,
      end: event.endDateTime,

      created: event.createdDateTime,
      lastModified: event.modifiedDateTime
    })

    const recurringEventExceptions = await EventException.find({eventID: event._id});
    let exceptions = [];
    for (exception of recurringEventExceptions) {
      exceptions.push(exception.startDateTime);
    }

    if (event.recurrenceRule) {
      let tempEventFrequency;

      if (event.recurrenceRule.frequency == 'Daily' || event.recurrenceRule.frequency == 'Weekly') {
        tempEventFrequency = event.recurrenceRule.frequency.toUpperCase();
      } else if (event.recurrenceRule.frequency == 'Monthly by day' || event.recurrenceRule.frequency == 'Monthly by date') {
        tempEventFrequency = 'MONTHLY';
      } else if (event.recurrenceRule.frequency == 'Yearly by day' || event.recurrenceRule.frequency == 'Yearly by date') {
        tempEventFrequency = 'YEARLY';
      }
  
      tempEvent.repeating({
        freq: tempEventFrequency,
        count: event.recurrenceRule.occurrences,
        interval: event.recurrenceRule.interval,
        byMonth: event.recurrenceRule.byMonth,
        byDay: (function(){
          if (event.recurrenceRule.byDay && event.recurrenceRule.byDay.length > 0) {
            return event.recurrenceRule.byDay;
          } else if (event.recurrenceRule.byWeekDayInMonth && event.recurrenceRule.byWeekDayInMonth.length > 0) {
            return event.recurrenceRule.byWeekDayInMonth;
          } else {
            return;
          }
        }()),
        byMonthDay: event.recurrenceRule.byMonthDay,
        until: event.recurrenceRule.untilDateTime,
        count: event.recurrenceRule.occurrences,
        //TODO: DEAL WITH EVENT EXCEPTIONS
        exclude: exceptions
      })
    }
  }

  res.setHeader('Content-Type', 'text/calendar');
  res.send(calendar.toString());
});

exports.getScheduleLinks = catchAsync(async (req, res, next) => {
  const scheduleLinks = await ScheduleLink.find({scheduleID: req.params.id});

  res.status(200).json({
    status: 'success',
    results: scheduleLinks.length,
    data: {
      scheduleLinks: scheduleLinks,
    },
  });
});

exports.createScheduleLink = catchAsync(async (req, res, next) => {
  //let scheduleLinks = [];

  // for (recipient in req.body.recipients) {
  //   let newScheduleLink = await ScheduleLink.create({
  //     scheduleID: req.params.id,
  //     recipient: recipient
  //   });

  //   scheduleLinks.push(newScheduleLink);
  // }

  let newScheduleLink = await ScheduleLink.create({
    scheduleID: req.params.id,
    recipient: req.body.recipient
  });

  let schedule = await Schedule.findById(newScheduleLink.scheduleID);

  const addToGoogleLink = `https://calendar.google.com/calendar/u/0/r?cid=webcal://clump.app/api/v1/schedules/${newScheduleLink.scheduleID}/exportSchedule/${newScheduleLink._id}`
  const message = `Add ${schedule.title} Schedule to Google Calendar ${addToGoogleLink}.`;

  try {
    await sendEmail({
      email: newScheduleLink.recipient,
      subject: 'Add this Schedule to Google Calendar',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Email Sent to Recipient.',
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }

  res.status(201).json({
    status: 'success',
    data: {
      scheduleLink: newScheduleLink,
    },
  });
});

exports.deleteScheduleLink = catchAsync(async (req, res, next) => {
  const scheduleLink = await ScheduleLink.findByIdAndDelete(req.params.linkId);

  if (!scheduleLink) {
    return next(new AppError('No scheduleLink found with that ID', 404));
  }

  res.status(204).send();
});
