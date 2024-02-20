const { google } = require('googleapis');



const OAUTH_ID = '888947135917-jiil3ap09evahjphl287echd997euuj0.apps.googleusercontent.com';
const OAUTH_SECRET = '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';
const OAUTH_REFRESH_TOKEN = '1//04tY3TyQrvg2eCgYIARAAGAQSNwF-L9IrZq3_JgQ1O_8j6tWVIgfFCxi8_9LeXIwojUD5WQxJv9ESYr6SzTUKH-IXnPQ405dmBrg';

const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(OAUTH_ID, OAUTH_SECRET);

oAuth2Client.setCredentials({
  refresh_token: OAUTH_REFRESH_TOKEN,
});

const gCalendar = google.calendar({ version: 'v3', auth: oAuth2Client });

/**
{
  "kind": "calendar#event",
  "etag": etag,
  "id": string,
  "status": string,
  "htmlLink": string,
  "created": datetime,
  "updated": datetime,
  "summary": string,
  "description": string,
  "location": string,
  "colorId": string,
  "creator": {
    "id": string,
    "email": string,
    "displayName": string,
    "self": boolean
  },
  "organizer": {
    "id": string,
    "email": string,
    "displayName": string,
    "self": boolean
  },
  "start": {
    "date": date,
    "dateTime": datetime,
    "timeZone": string
  },
  "end": {
    "date": date,
    "dateTime": datetime,
    "timeZone": string
  },
  "endTimeUnspecified": boolean,
  "recurrence": [
    string
  ],
  "recurringEventId": string,
  "originalStartTime": {
    "date": date,
    "dateTime": datetime,
    "timeZone": string
  },
  "transparency": string,
  "visibility": string,
  "iCalUID": string,
  "sequence": integer,
  "attendees": [
    {
      "id": string,
      "email": string,
      "displayName": string,
      "organizer": boolean,
      "self": boolean,
      "resource": boolean,
      "optional": boolean,
      "responseStatus": string,
      "comment": string,
      "additionalGuests": integer
    }
  ],
  "attendeesOmitted": boolean,
  "extendedProperties": {
    "private": {
      (key): string
    },
    "shared": {
      (key): string
    }
  },
  "hangoutLink": string,
  "conferenceData": {
    "createRequest": {
      "requestId": string,
      "conferenceSolutionKey": {
        "type": string
      },
      "status": {
        "statusCode": string
      }
    },
    "entryPoints": [
      {
        "entryPointType": string,
        "uri": string,
        "label": string,
        "pin": string,
        "accessCode": string,
        "meetingCode": string,
        "passcode": string,
        "password": string
      }
    ],
    "conferenceSolution": {
      "key": {
        "type": string
      },
      "name": string,
      "iconUri": string
    },
    "conferenceId": string,
    "signature": string,
    "notes": string,
  },
  "gadget": {
    "type": string,
    "title": string,
    "link": string,
    "iconLink": string,
    "width": integer,
    "height": integer,
    "display": string,
    "preferences": {
      (key): string
    }
  },
  "anyoneCanAddSelf": boolean,
  "guestsCanInviteOthers": boolean,
  "guestsCanModify": boolean,
  "guestsCanSeeOtherGuests": boolean,
  "privateCopy": boolean,
  "locked": boolean,
  "reminders": {
    "useDefault": boolean,
    "overrides": [
      {
        "method": string,
        "minutes": integer
      }
    ]
  },
  "source": {
    "url": string,
    "title": string
  },
  "workingLocationProperties": {
    "type": string,
    "homeOffice": (value),
    "customLocation": {
      "label": string
    },
    "officeLocation": {
      "buildingId": string,
      "floorId": string,
      "floorSectionId": string,
      "deskId": string,
      "label": string
    }
  },
  "outOfOfficeProperties": {
    "autoDeclineMode": string,
    "declineMessage": string
  },
  "focusTimeProperties": {
    "autoDeclineMode": string,
    "declineMessage": string,
    "chatStatus": string
  },
  "attachments": [
    {
      "fileUrl": string,
      "title": string,
      "mimeType": string,
      "iconLink": string,
      "fileId": string
    }
  ],
  "eventType": string
}
**/

var event = {
  'summary': 'Mission Conference',
  'location': 'St. George',
  'description': 'Special guest speaker Elder Bednar.',
  'start': {
    'dateTime': '2024-03-28T09:00:00-07:00',
    'timeZone': 'America/Denver',
  },
  'end': {
    'dateTime': '2024-03-28T17:00:00-07:00',
    'timeZone': 'America/Denver',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=1'
  ],
  'attendees': [
    {'email': 'antoinemflorian@gmail.com'},
    {'email': 'v7f8l57nf8r2hh82ttu8jjprd0@group.calendar.google.com'},
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
  'attachments': [
    {
      'fileUrl': 'https://clump.app',
      'title': '235235235',
      'mimeType': 'text/plain'
    }
  ],
};

gCalendar.calendars.get({calendarId: 'antoinemflorian@gmail.com'});

gCalendar.events.insert({
  auth: oAuth2Client,
  calendarId: 'primary',
  resource: event,
  supportsAttachments: true
}, function(err, event) {
  if (err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return;
  }
  console.log('Event created: %s', event.data);
});