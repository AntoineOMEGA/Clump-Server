# Event Attendees API

## Endpoints

### GET /api/v1/event-attendees

Retrieve a list of event attendees.

**Response:**

```json
[
  {
    "id": "attendee_id",
    "name": "attendee_name",
    "event": "event_id"
  }
]
```

### POST /api/v1/event-attendees

Add a new event attendee.

**Request:**

```json
{
  "name": "attendee_name",
  "event": "event_id"
}
```

**Response:**

```json
{
  "id": "attendee_id",
  "name": "attendee_name",
  "event": "event_id"
}
```

// ...additional endpoints and details...
