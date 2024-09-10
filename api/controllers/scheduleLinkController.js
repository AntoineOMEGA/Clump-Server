const ScheduleLink = require('../models/scheduleLinkModel');
const Schedule = require('../models/scheduleModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel');

const RRuleLib = require('rrule');
const RRule = RRuleLib.RRule;
const datetime = RRuleLib.datetime;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const ical = require('ical-generator');

exports.generateICal = catchAsync(async (req, res, next) => {
  console.log("hi");
  const schedule = await Schedule.findById(req.params.id);
  const calendar = new ical.ICalCalendar({ name: schedule.title });

  let eventQuery = {
    scheduleID: req.params.id
  };

  const events = await Event.find(eventQuery);

  for (let event of events) {
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
  }

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//Your App//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:12345678@yourapp.com
DTSTAMP:20230823T120000Z
DTSTART:20240823T130000Z
DTEND:20240823T140000Z
SUMMARY:Sample Event
DESCRIPTION:This is a sample event in a generated .ics file.
END:VEVENT
END:VCALENDAR`;

const newContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//sebbo.net//ical-generator//EN
NAME:THing
X-WR-CALNAME:THing
BEGIN:VEVENT
UID:a1f2d022-b6d4-4942-adf8-5b69aa1de3cb
SEQUENCE:0
DTSTAMP:20240910T053534Z
DTSTART:20240904T213615Z
DTEND:20240904T213615Z
SUMMARY:TEST BYDAY
CREATED:20240904T213610Z
LAST-MODIFIED:20240904T213610Z
END:VEVENT
BEGIN:VEVENT
UID:3d32bcc1-23a8-44cf-b58c-11f5a60790fa
SEQUENCE:0
DTSTAMP:20240910T053534Z
DTSTART:20240904T214138Z
DTEND:20240904T214138Z
SUMMARY:TEST BYWEEKDAYINMONTH
CREATED:20240904T214129Z
LAST-MODIFIED:20240904T214129Z
END:VEVENT
BEGIN:VEVENT
UID:77cf91fd-7386-4952-9b26-999ec005e0f0
SEQUENCE:0
DTSTAMP:20240910T053534Z
DTSTART:20240904T215342Z
DTEND:20240904T215342Z
SUMMARY:TEST DAILY
CREATED:20240904T215336Z
LAST-MODIFIED:20240904T215336Z
END:VEVENT
BEGIN:VEVENT
UID:5505badf-6f82-4231-bc8a-72ef7adb77fb
SEQUENCE:0
DTSTAMP:20240910T053534Z
DTSTART:20240904T215624Z
DTEND:20240904T215624Z
SUMMARY:adfsgh
CREATED:20240904T215336Z
LAST-MODIFIED:20240904T215336Z
END:VEVENT
END:VCALENDAR`;

  console.log(calendar.toString());
  res.setHeader('Content-Type', 'text/calendar');
  res.send(newContent);
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
