const { google } = require('googleapis');



const OAUTH_ID = '888947135917-jiil3ap09evahjphl287echd997euuj0.apps.googleusercontent.com';
const OAUTH_SECRET = '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';
const OAUTH_REFRESH_TOKEN = '1//04BPmiCS6VomlCgYIARAAGAQSNwF-L9IrOXD5gQnB7O4qA404_iRWL7hTXuThhnwSwRWS53sMj2orCeWhBofsiQgN812p9og3A0Y';

const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(OAUTH_ID, OAUTH_SECRET);

oAuth2Client.setCredentials({
  refresh_token: OAUTH_REFRESH_TOKEN,
});

const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });

var event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2024-05-28T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': '2024-05-28T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'},
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

gCalendar.calendars.get({calendarId: 'antoinemflorian@gmail.com'});

gCalendar.events.insert({
  auth: oAuth2Client,
  calendarId: 'primary',
  resource: event,
}, function(err, event) {
  if (err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return;
  }
  console.log('Event created: %s', event.htmlLink);
});