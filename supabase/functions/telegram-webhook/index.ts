/**
 * Telegram Webhook Handler
 *
 * Receives messages from Telegram bot and creates tasks
 *
 * Setup:
 * 1. Create bot with @BotFather
 * 2. Set webhook: https://your-supabase.co/functions/v1/telegram-webhook
 * 3. Add TELEGRAM_BOT_TOKEN to Supabase secrets
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { id: number; username?: string };
    text?: string;
  };
}

interface ParsedTask {
  title: string;
  priority?: 'must' | 'should' | 'want' | 'someday';
  energy_required?: 'low' | 'medium' | 'high';
}

// Parse task from message text
// Examples:
// "Buy groceries" -> { title: "Buy groceries" }
// "!must Call doctor" -> { title: "Call doctor", priority: "must" }
// "#low Read article" -> { title: "Read article", energy_required: "low" }
// "!should #high Write report" -> { title: "Write report", priority: "should", energy_required: "high" }
function parseTaskFromMessage(text: string): ParsedTask {
  let title = text.trim();
  let priority: ParsedTask['priority'];
  let energy_required: ParsedTask['energy_required'];

  // Parse priority (!must, !should, !want, !someday)
  const priorityMatch = title.match(/^!(must|should|want|someday)\s+/i);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as ParsedTask['priority'];
    title = title.replace(priorityMatch[0], '');
  }

  // Parse energy (#low, #medium, #high)
  const energyMatch = title.match(/#(low|medium|high)\s*/i);
  if (energyMatch) {
    energy_required = energyMatch[1].toLowerCase() as ParsedTask['energy_required'];
    title = title.replace(energyMatch[0], '').trim();
  }

  return { title, priority, energy_required };
}

// Send message to Telegram
async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

serve(async (req) => {
  try {
    const update: TelegramUpdate = await req.json();

    if (!update.message?.text) {
      return new Response('OK', { status: 200 });
    }

    const { chat, from, text } = update.message;
    const telegramUserId = from?.id;

    if (!telegramUserId) {
      return new Response('OK', { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find user by telegram_id in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegramUserId)
      .single();

    if (profileError || !profile) {
      await sendTelegramMessage(
        chat.id,
        '❌ Your Telegram is not linked to ADHD Focus.\n\n' +
        'Open the app → Settings → Link Telegram'
      );
      return new Response('OK', { status: 200 });
    }

    // Handle commands
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].toLowerCase();

      switch (command) {
        case '/start':
        case '/help':
          await sendTelegramMessage(
            chat.id,
            '📝 *ADHD Focus Bot*\n\n' +
            'Send any message to create a task in your Inbox.\n\n' +
            '*Modifiers:*\n' +
            '`!must` / `!should` / `!want` - priority\n' +
            '`#low` / `#medium` / `#high` - energy\n\n' +
            '*Example:*\n' +
            '`!must #low Call doctor`\n\n' +
            '*Commands:*\n' +
            '/today - Show today\'s tasks\n' +
            '/inbox - Show inbox count'
          );
          break;

        case '/today':
          const { data: todayTasks } = await supabase
            .from('tasks')
            .select('title, priority, status')
            .eq('user_id', profile.id)
            .in('status', ['today', 'in_progress'])
            .order('priority');

          if (!todayTasks?.length) {
            await sendTelegramMessage(chat.id, '📭 No tasks for today');
          } else {
            const taskList = todayTasks
              .map((t, i) => {
                const emoji = t.status === 'in_progress' ? '🔥' : '⬜';
                return `${emoji} ${t.title}`;
              })
              .join('\n');
            await sendTelegramMessage(chat.id, `📋 *Today's tasks:*\n\n${taskList}`);
          }
          break;

        case '/inbox':
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .eq('status', 'inbox');

          await sendTelegramMessage(chat.id, `📥 Inbox: ${count || 0} tasks`);
          break;

        default:
          await sendTelegramMessage(chat.id, '❓ Unknown command. Send /help for usage.');
      }

      return new Response('OK', { status: 200 });
    }

    // Create task from message
    const parsed = parseTaskFromMessage(text);

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: profile.id,
        title: parsed.title,
        priority: parsed.priority || 'want',
        energy_required: parsed.energy_required || 'medium',
        status: 'inbox',
      })
      .select()
      .single();

    if (taskError) {
      await sendTelegramMessage(chat.id, '❌ Failed to create task');
      console.error('Task creation error:', taskError);
    } else {
      const priorityEmoji = {
        must: '🔴',
        should: '🟡',
        want: '🟢',
        someday: '⚪',
      };
      const energyEmoji = {
        low: '🔋',
        medium: '🔋🔋',
        high: '🔋🔋🔋',
      };

      await sendTelegramMessage(
        chat.id,
        `✅ *Task added to Inbox*\n\n` +
        `${parsed.title}\n` +
        `${priorityEmoji[task.priority]} ${task.priority} • ${energyEmoji[task.energy_required]} ${task.energy_required}`
      );
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
});
