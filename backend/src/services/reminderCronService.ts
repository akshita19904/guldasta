import Reminder, { IReminder } from '../models/Reminder';
import Person from '../models/Person';
import User from '../models/User';
import { sendReminderEmail, sendCatchUpReminderEmail } from './emailService';

/**
 * Given a reminder's stored date, return the next upcoming occurrence.
 * - If recurringYearly: bump the date to this year (or next year, if this year's
 *   occurrence has already passed by more than the catch-up grace window).
 * - If not recurring: just return the stored date as-is.
 */
function getNextOccurrence(reminder: IReminder, today: Date): Date {
  const original = new Date(reminder.date);

  if (!reminder.recurringYearly) {
    return original;
  }

  const thisYear = new Date(original);
  thisYear.setFullYear(today.getFullYear());

  // Normalize to midnight for clean day-diff math
  thisYear.setHours(0, 0, 0, 0);

  const CATCH_UP_GRACE_DAYS = 3;
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffFromThisYear = Math.round((thisYear.getTime() - today.getTime()) / msPerDay);

  // If this year's occurrence is more than the grace window in the past,
  // we've fully missed it — point to next year's occurrence instead.
  if (diffFromThisYear < -CATCH_UP_GRACE_DAYS) {
    const nextYear = new Date(thisYear);
    nextYear.setFullYear(today.getFullYear() + 1);
    return nextYear;
  }

  return thisYear;
}

function daysBetween(today: Date, target: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / msPerDay);
}

export async function runReminderCheck(): Promise<{
  advanceSent: number;
  sameDaySent: number;
  catchUpSent: number;
  errors: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  const stats = { advanceSent: 0, sameDaySent: 0, catchUpSent: 0, errors: 0 };

  const reminders = await Reminder.find({
    manuallyDeleted: { $ne: true },
    isCompleted: { $ne: true },
  });

  for (const reminder of reminders) {
    try {
      // Reset notif flags if they're carried over from a previous year's occurrence
      if (reminder.notifYear !== currentYear) {
        reminder.advanceNotifSent = false;
        reminder.sameDayNotifSent = false;
        reminder.notifYear = currentYear;
      }

      const nextOccurrence = getNextOccurrence(reminder, today);
      const daysUntil = daysBetween(today, nextOccurrence);

      // Resolve recipient + display name
      let toEmail: string | undefined;
      let toName = 'there';
      let personName = reminder.title;

      const user = await User.findById(reminder.userId);
      if (user) {
        toEmail = user.email;
        toName = user.name || 'there';
      }

      if (reminder.personId) {
        const person = await Person.findById(reminder.personId);
        if (person) personName = person.name;
      }

      if (!toEmail) {
        await reminder.save(); // still persist flag reset
        continue;
      }

      // Same-day takes priority check first (most urgent), then advance, then catch-up.
      if (daysUntil === 0 && !reminder.sameDayNotifSent) {
        await sendReminderEmail(toEmail, toName, reminder.title, 0, personName);
        reminder.sameDayNotifSent = true;
        reminder.advanceNotifSent = true; // same-day passing implies advance window passed too
        stats.sameDaySent++;
      } else if (daysUntil === reminder.remindDaysBefore && !reminder.advanceNotifSent) {
        await sendReminderEmail(toEmail, toName, reminder.title, daysUntil, personName);
        reminder.advanceNotifSent = true;
        stats.advanceSent++;
      } else if (daysUntil < 0 && daysUntil >= -3 && !reminder.sameDayNotifSent) {
        // Missed it — server was probably down. Send a catch-up email once.
        await sendCatchUpReminderEmail(toEmail, toName, reminder.title, Math.abs(daysUntil), personName);
        reminder.advanceNotifSent = true;
        reminder.sameDayNotifSent = true;
        stats.catchUpSent++;
      }

      await reminder.save();
    } catch (err) {
      console.error(`Reminder check failed for reminder ${reminder._id}:`, err);
      stats.errors++;
    }
  }

  return stats;
}