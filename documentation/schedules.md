# Schedules API

## Endpoints

### GET /api/v1/schedules

Retrieve a list of schedules.

**Response:**

```json
[
  {
    "id": "schedule_id",
    "name": "schedule_name",
    "events": []
  }
]
```

### POST /api/v1/schedules

Create a new schedule.

**Request:**

```json
{
  "name": "schedule_name",
  "events": []
}
```

**Response:**

```json
{
  "id": "schedule_id",
  "name": "schedule_name",
  "events": []
}
```

// ...additional endpoints and details...
