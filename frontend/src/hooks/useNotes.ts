import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface Note {
  _id: string;
  content: string;
  tag: 'preference' | 'milestone' | 'memory';
  createdAt: string;
}

export const useNotes = (personId: string | null) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!personId) {
      setNotes([]);
      return;
    }
    fetchNotes();
  }, [personId]);

  const fetchNotes = async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const res = await api.get(`/notes/${personId}`);
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (content: string, tag: string) => {
    if (!personId) return;
    const res = await api.post('/notes', { personId, content, tag });
    setNotes(prev => [res.data.note, ...prev]);
  };

  const deleteNote = async (id: string) => {
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
  };

  return { notes, loading, addNote, deleteNote, refetch: fetchNotes };
};