import { Response } from 'express';
import Reminder from '../models/Reminder';
import Person from '../models/Person';
import { AuthRequest } from '../middleware/auth';

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id, manuallyDeleted: { $ne: true } })
      .populate('personId', 'name relationship')
      .sort({ date: 1 });
    res.status(200).json({ success: true, reminders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = await Reminder.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, reminder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!reminder) {
      res.status(404).json({ success: false, message: 'Reminder not found' });
      return;
    }
    res.status(200).json({ success: true, reminder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      res.status(404).json({ success: false, message: 'Reminder not found' });
      return;
    }

    if (reminder.personId) {
      // Synced reminder — soft delete so "Sync circle" doesn't recreate it
      reminder.manuallyDeleted = true;
      await reminder.save();
    } else {
      // Custom/manual reminder — fully remove
      await Reminder.findByIdAndDelete(req.params.id);
    }

    res.status(200).json({ success: true, message: 'Reminder deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncPeopleReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const people = await Person.find({ userId: req.user._id });
    let created = 0;

    for (const person of people) {
      if (person.birthday) {
        const exists = await Reminder.findOne({ userId: req.user._id, personId: person._id, type: 'birthday' });
        if (!exists) {
          await Reminder.create({
            userId: req.user._id,
            personId: person._id,
            title: `${person.name}'s Birthday`,
            date: person.birthday,
            type: 'birthday',
            remindDaysBefore: 7,
            recurringYearly: true
          });
          created++;
        }
      }
      if (person.anniversary) {
        const exists = await Reminder.findOne({ userId: req.user._id, personId: person._id, type: 'anniversary' });
        if (!exists) {
          await Reminder.create({
            userId: req.user._id,
            personId: person._id,
            title: `${person.name}'s Anniversary`,
            date: person.anniversary,
            type: 'anniversary',
            remindDaysBefore: 14,
            recurringYearly: true
          });
          created++;
        }
      }
    }

    res.status(200).json({ success: true, message: `${created} reminders synced` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const indianHolidays2026 = [
  { title: 'Republic Day', date: '2026-01-26' },
  { title: 'Holi', date: '2026-03-04' },
  { title: 'Independence Day', date: '2026-08-15' },
  { title: 'Raksha Bandhan', date: '2026-08-28' },
  { title: 'Ganesh Chaturthi', date: '2026-09-14' },
  { title: 'Gandhi Jayanti', date: '2026-10-02' },
  { title: 'Dussehra', date: '2026-10-20' },
  { title: 'Diwali', date: '2026-11-08' },
  { title: 'Christmas', date: '2026-12-25' },
];

export const syncIndianHolidays = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let created = 0;
    for (const holiday of indianHolidays2026) {
      const exists = await Reminder.findOne({
        userId: req.user._id,
        title: holiday.title,
        type: 'holiday'
      });
      if (!exists) {
        await Reminder.create({
          userId: req.user._id,
          title: holiday.title,
          date: new Date(holiday.date),
          type: 'holiday',
          remindDaysBefore: 3,
          recurringYearly: true
        });
        created++;
      }
    }
    res.status(200).json({ success: true, message: `${created} holidays added` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};