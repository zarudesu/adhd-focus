# ADHD Focus API Documentation

## Overview

ADHD Focus provides a REST API powered by Supabase (PostgREST). The API can be used for:
- Telegram bots
- Calendar integrations
- Custom scripts
- Third-party apps

## Base URL

- **Cloud**: `https://your-project.supabase.co/rest/v1`
- **Self-hosted**: `http://localhost:8000/rest/v1`

## Authentication

All requests require authentication via API key or JWT token.

### Option 1: API Key (for bots/scripts)

```bash
curl -X GET "https://your-project.supabase.co/rest/v1/tasks" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_USER_JWT"
```

### Option 2: Service Role Key (admin access)

```bash
curl -X GET "https://your-project.supabase.co/rest/v1/tasks" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## Tasks API

### List Tasks

```http
GET /rest/v1/tasks
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `inbox`, `today`, `in_progress`, `done` |
| `priority` | string | Filter by priority: `must`, `should`, `want`, `someday` |
| `energy_required` | string | Filter by energy: `low`, `medium`, `high` |
| `select` | string | Fields to return (default: all) |
| `order` | string | Sort order, e.g., `created_at.desc` |
| `limit` | int | Max results |
| `offset` | int | Pagination offset |

**Example:**

```bash
# Get today's tasks ordered by priority
curl -X GET "https://xxx.supabase.co/rest/v1/tasks?status=eq.today&order=priority.asc" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_JWT"
```

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Call doctor",
    "status": "today",
    "priority": "must",
    "energy_required": "low",
    "estimated_minutes": 15,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### Get Single Task

```http
GET /rest/v1/tasks?id=eq.{task_id}&select=*
```

### Create Task

```http
POST /rest/v1/tasks
```

**Body:**

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "should",
  "energy_required": "medium",
  "status": "inbox",
  "estimated_minutes": 30
}
```

**Example (curl):**

```bash
curl -X POST "https://xxx.supabase.co/rest/v1/tasks" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Buy groceries",
    "priority": "should",
    "energy_required": "medium",
    "status": "inbox"
  }'
```

### Update Task

```http
PATCH /rest/v1/tasks?id=eq.{task_id}
```

**Example - Mark as complete:**

```bash
curl -X PATCH "https://xxx.supabase.co/rest/v1/tasks?id=eq.abc123" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "status": "done",
    "completed_at": "2024-01-15T15:30:00Z"
  }'
```

### Delete Task

```http
DELETE /rest/v1/tasks?id=eq.{task_id}
```

### Move Task to Today

```bash
curl -X PATCH "https://xxx.supabase.co/rest/v1/tasks?id=eq.abc123" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "today",
    "scheduled_date": "2024-01-15"
  }'
```

## Focus Sessions API

### Start Session

```http
POST /rest/v1/focus_sessions
```

```json
{
  "task_id": "optional-task-uuid",
  "started_at": "2024-01-15T10:00:00Z"
}
```

### End Session

```http
PATCH /rest/v1/focus_sessions?id=eq.{session_id}
```

```json
{
  "ended_at": "2024-01-15T10:25:00Z",
  "duration_minutes": 25,
  "pomodoros": 1,
  "completed": true
}
```

## Profile API

### Get Current User Profile

```http
GET /rest/v1/profiles?id=eq.{user_id}&select=*
```

### Update Profile

```http
PATCH /rest/v1/profiles?id=eq.{user_id}
```

```json
{
  "display_name": "John",
  "timezone": "America/New_York",
  "pomodoro_minutes": 25,
  "telegram_id": 123456789
}
```

## Telegram Bot Integration

### Webhook URL

```
POST https://your-project.supabase.co/functions/v1/telegram-webhook
```

### Setup

1. Create bot with @BotFather
2. Set webhook:

```bash
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.supabase.co/functions/v1/telegram-webhook"}'
```

3. Add `TELEGRAM_BOT_TOKEN` to Supabase secrets

### Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and help |
| `/help` | Show usage instructions |
| `/today` | List today's tasks |
| `/inbox` | Show inbox count |

### Quick Add Syntax

Send any message to create a task:

```
Buy groceries
```

With modifiers:

```
!must Call doctor           # Priority: must
#low Read article           # Energy: low
!should #high Write report  # Priority + energy
```

## Google Calendar Sync

### Sync Task to Calendar

```http
POST /functions/v1/google-calendar-sync
Authorization: Bearer YOUR_JWT
```

```json
{
  "user_id": "uuid",
  "action": "sync_task",
  "task_id": "task-uuid"
}
```

### Sync All Tasks

```json
{
  "user_id": "uuid",
  "action": "sync_all"
}
```

### Delete Calendar Event

```json
{
  "user_id": "uuid",
  "action": "delete_event",
  "task_id": "task-uuid"
}
```

## Webhooks (Outgoing)

Receive notifications when tasks change.

### Register Webhook

```http
POST /rest/v1/webhooks
```

```json
{
  "name": "My Integration",
  "url": "https://your-server.com/webhook",
  "events": ["task.created", "task.completed"],
  "secret": "your-webhook-secret"
}
```

### Available Events

| Event | Description |
|-------|-------------|
| `task.created` | New task added |
| `task.updated` | Task modified |
| `task.completed` | Task marked done |
| `task.deleted` | Task removed |
| `session.started` | Focus session began |
| `session.completed` | Focus session ended |

### Webhook Payload

```json
{
  "event": "task.completed",
  "timestamp": "2024-01-15T15:30:00Z",
  "data": {
    "id": "task-uuid",
    "title": "Buy groceries",
    "status": "done"
  }
}
```

### Signature Verification

Webhooks include `X-Webhook-Signature` header (HMAC-SHA256).

```python
import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

## Rate Limits

| Tier | Requests/min | Burst |
|------|-------------|-------|
| Free | 100 | 20 |
| Pro | 1000 | 100 |
| Self-hosted | Unlimited | - |

## Error Responses

```json
{
  "code": "PGRST301",
  "message": "JWT expired",
  "details": null,
  "hint": null
}
```

| Code | Description |
|------|-------------|
| `401` | Unauthorized - missing or invalid auth |
| `403` | Forbidden - RLS policy violation |
| `404` | Not found |
| `409` | Conflict - duplicate key |
| `422` | Validation error |

## Python Client Example

```python
from supabase import create_client, Client

url = "https://xxx.supabase.co"
key = "your-anon-key"

supabase: Client = create_client(url, key)

# Login
supabase.auth.sign_in_with_password({
    "email": "user@example.com",
    "password": "password"
})

# Create task
task = supabase.table("tasks").insert({
    "title": "Buy groceries",
    "priority": "should",
    "status": "inbox"
}).execute()

# Get today's tasks
today = supabase.table("tasks") \
    .select("*") \
    .eq("status", "today") \
    .order("priority") \
    .execute()

print(today.data)
```

## curl Examples

```bash
# Set variables
export API_URL="https://xxx.supabase.co/rest/v1"
export ANON_KEY="your-anon-key"
export JWT="your-user-jwt"

# List inbox tasks
curl "$API_URL/tasks?status=eq.inbox" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT"

# Create task
curl -X POST "$API_URL/tasks" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"title": "Test task", "status": "inbox"}'

# Complete task
curl -X PATCH "$API_URL/tasks?id=eq.TASK_ID" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```
