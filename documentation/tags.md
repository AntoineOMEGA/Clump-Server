# Tags API

## Endpoints

### GET /api/v1/tags

Retrieve a list of tags.

**Response:**

```json
[
  {
    "id": "tag_id",
    "name": "tag_name"
  }
]
```

### POST /api/v1/tags

Create a new tag.

**Request:**

```json
{
  "name": "tag_name"
}
```

**Response:**

```json
{
  "id": "tag_id",
  "name": "tag_name"
}
```

// ...additional endpoints and details...
