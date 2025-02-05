# Roles API

## Endpoints

### GET /api/v1/roles

Retrieve a list of roles.

**Response:**

```json
[
  {
    "id": "role_id",
    "name": "role_name"
  }
]
```

### POST /api/v1/roles

Create a new role.

**Request:**

```json
{
  "name": "role_name"
}
```

**Response:**

```json
{
  "id": "role_id",
  "name": "role_name"
}
```

// ...additional endpoints and details...
