import { Response } from 'express';
import Note from '../models/Note';
import { AuthRequest } from '../middleware/auth';

export const getNotesForPerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notes = await Note.find({ userId: req.user._id, personId: req.params.personId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { personId, content, tag } = req.body;

    if (!personId || !content) {
      res.status(400).json({ success: false, message: 'Person and note content are required' });
      return;
    }

    const note = await Note.create({
      userId: req.user._id,
      personId,
      content,
      tag: tag || 'memory'
    });

    res.status(201).json({ success: true, note });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};