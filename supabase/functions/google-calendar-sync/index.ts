/**
 * Google Calendar Sync
 *
 * Syncs tasks with scheduled dates to Google Calendar
 * Can be triggered via:
 * - Webhook from app when task is scheduled
 * - Cron job for periodic sync
 *
 * Setup:
 * 1. Create Google Cloud project
 * 2. Enable Calendar API
 * 3. Create OAuth credentials
 * 4. Store tokens in profiles.google_calendar_token
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

interface SyncRequest {
  user_id: string;
  action: 'sync_task' | 'sync_all' | 'delete_event';
  task_id?: string;
}

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

// Refresh Google access token if expired
async function refreshTokenIfNeeded(tokens: GoogleTokens): Promise<GoogleTokens> {
  if (Date.now() < tokens.expiry_date - 60000) {
    return tokens; // Still valid
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  };
}

// Create or update calendar event
async function upsertCalendarEvent(
  accessToken: string,
  calendarId: string,
  task: {
    id: string;
    title: string;
    description?: string;
    scheduled_date: string;
    estimated_minutes?: number;
    google_event_id?: string;
  }
): Promise<string> {
  const startDate = new Date(task.scheduled_date);
  const endDate = new Date(startDate.getTime() + (task.estimated_minutes || 30) * 60000);

  const event = {
    summary: task.title,
    description: task.description || `ADHD Focus task: ${task.id}`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'UTC',
    },
    extendedProperties: {
      private: {
        adhd_focus_task_id: task.id,
      },
    },
  };

  const url = task.google_event_id
    ? `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${task.google_event_id}`
    : `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

  const response = await fetch(url, {
    method: task.google_event_id ? 'PUT' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  const data = await response.json();
  return data.id;
}

// Delete calendar event
async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

serve(async (req) => {
  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const request: SyncRequest = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's Google Calendar tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_calendar_token, google_calendar_id')
      .eq('id', request.user_id)
      .single();

    if (profileError || !profile?.google_calendar_token) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not connected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let tokens: GoogleTokens = profile.google_calendar_token;
    const calendarId = profile.google_calendar_id || 'primary';

    // Refresh token if needed
    tokens = await refreshTokenIfNeeded(tokens);

    // Update tokens in DB if refreshed
    if (tokens.access_token !== profile.google_calendar_token.access_token) {
      await supabase
        .from('profiles')
        .update({ google_calendar_token: tokens })
        .eq('id', request.user_id);
    }

    switch (request.action) {
      case 'sync_task': {
        if (!request.task_id) {
          return new Response(
            JSON.stringify({ error: 'task_id required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const { data: task } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', request.task_id)
          .single();

        if (!task || !task.scheduled_date) {
          return new Response(
            JSON.stringify({ error: 'Task not found or not scheduled' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const eventId = await upsertCalendarEvent(tokens.access_token, calendarId, task);

        // Store event ID in task
        await supabase
          .from('tasks')
          .update({ google_event_id: eventId })
          .eq('id', request.task_id);

        return new Response(
          JSON.stringify({ success: true, event_id: eventId }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_all': {
        // Sync all scheduled tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', request.user_id)
          .not('scheduled_date', 'is', null)
          .neq('status', 'done');

        const results = [];
        for (const task of tasks || []) {
          try {
            const eventId = await upsertCalendarEvent(tokens.access_token, calendarId, task);
            await supabase
              .from('tasks')
              .update({ google_event_id: eventId })
              .eq('id', task.id);
            results.push({ task_id: task.id, event_id: eventId, success: true });
          } catch (err) {
            results.push({ task_id: task.id, success: false, error: String(err) });
          }
        }

        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_event': {
        if (!request.task_id) {
          return new Response(
            JSON.stringify({ error: 'task_id required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const { data: task } = await supabase
          .from('tasks')
          .select('google_event_id')
          .eq('id', request.task_id)
          .single();

        if (task?.google_event_id) {
          await deleteCalendarEvent(tokens.access_token, calendarId, task.google_event_id);
          await supabase
            .from('tasks')
            .update({ google_event_id: null })
            .eq('id', request.task_id);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Calendar sync error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
