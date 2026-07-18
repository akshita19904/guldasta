import cron from 'node-cron';
import { runReminderCheck } from './reminderCronService';

/**
 * Registers the daily reminder cron job.
 * Runs every day at 00:00 server time.
 *
 * Cron string breakdown: '0 0 * * *'
 *   minute(0) hour(0) day-of-month(*) month(*) day-of-week(*)
 */
export function startReminderCron(): void {
  cron.schedule('0 0 * * *', async () => {
    console.log('[reminder-cron] Running daily reminder check...');
    try {
      const stats = await runReminderCheck();
      console.log(
        `[reminder-cron] Done. Advance: ${stats.advanceSent}, SameDay: ${stats.sameDaySent}, CatchUp: ${stats.catchUpSent}, Errors: ${stats.errors}`
      );
    } catch (err) {
      console.error('[reminder-cron] Fatal error during reminder check:', err);
    }
  });

  console.log('[reminder-cron] Scheduled for 00:00 daily.');
}