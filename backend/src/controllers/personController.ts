import { Response } from 'express';
import Person from '../models/Person';
import { AuthRequest } from '../middleware/auth';

export const getPeople = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const people = await Person.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, people });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, relationship, birthday, anniversary, interests, notes, phone, email } = req.body;
    if (!name || !relationship) {
      res.status(400).json({ success: false, message: 'Name and relationship are required' });
      return;
    }
    const person = await Person.create({
      userId: req.user._id,
      name, relationship, birthday, anniversary,
      interests: interests ? interests.split(',').map((i: string) => i.trim()) : [],
      notes, phone, email
    });
    res.status(201).json({ success: true, person });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const person = await Person.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!person) {
      res.status(404).json({ success: false, message: 'Person not found' });
      return;
    }
    res.status(200).json({ success: true, person });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const person = await Person.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!person) {
      res.status(404).json({ success: false, message: 'Person not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Person deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const people = await Person.find({ userId: req.user._id });
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingBirthdays = people.filter(p => {
      if (!p.birthday) return false;
      const bday = new Date(p.birthday);
      const nextBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
      if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
      return nextBday <= thirtyDaysLater;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalPeople: people.length,
        upcomingBirthdays: upcomingBirthdays.length,
        upcomingBirthdaysList: upcomingBirthdays.map(p => ({
          name: p.name,
          relationship: p.relationship,
          birthday: p.birthday
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};