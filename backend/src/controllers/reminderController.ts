import { Response } from 'express';
import Reminder from '../models/Reminder';
import Person from '../models/Person';
import { AuthRequest } from '../middleware/auth';

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
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
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
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