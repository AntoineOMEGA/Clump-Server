# Event Templates API

## Endpoints

### GET /api/v1/event-templates

Retrieve a list of event templates.

**Response:**

```json
[
  {
    "id": "template_id",
    "name": "template_name",
    "description": "template_description"
  }
]
```

### POST /api/v1/event-templates

Create a new event template.

**Request:**

```json
{
  "name": "template_name",
  "description": "template_description"
}
```

**Response:**

```json
{
  "id": "template_id",
  "name": "template_name",
  "description": "template_description"
}
```

### PUT /api/v1/event-templates/{id}

Update an existing event template.

**Request:**

```json
{
  "name": "template_name",
  "description": "template_description"
}
```

**Response:**

```json
{
  "id": "template_id",
  "name": "template_name",
  "description": "template_description"
}
```

// ...additional endpoints and details...
