import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'custom' | 'holiday';
  remindDaysBefore: number;
  isCompleted: boolean;
  recurringYearly: boolean;
  personId?: { _id: string; name: string; relationship: string; };
  createdAt: string;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      setReminders(res.data.reminders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (data: any) => {
    const res = await api.post('/reminders', data);
    setReminders(prev => [...prev, res.data.reminder]);
    return res.data.reminder;
  };

  const deleteReminder = async (id: string) => {
    await api.delete(`/reminders/${id}`);
    setReminders(prev => prev.filter(r => r._id !== id));
  };

  const toggleComplete = async (id: string, isCompleted: boolean) => {
    const res = await api.put(`/reminders/${id}`, { isCompleted });
    setReminders(prev => prev.map(r => r._id === id ? res.data.reminder : r));
  };

  const syncReminders = async () => {
    await api.post('/reminders/sync');
    fetchReminders();
  };

  useEffect(() => { fetchReminders(); }, []);

  return { reminders, loading, addReminder, deleteReminder, toggleComplete, syncReminders, fetchReminders };
};