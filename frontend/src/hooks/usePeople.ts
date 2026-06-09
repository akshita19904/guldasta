import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface Person {
  _id: string;
  name: string;
  relationship: string;
  birthday?: string;
  anniversary?: string;
  interests?: string[];
  notes?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export const usePeople = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPeople = async () => {
    try {
      const res = await api.get('/people');
      setPeople(res.data.people);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async (data: any)  => {
    const res = await api.post('/people', data);
    setPeople(prev => [res.data.person, ...prev]);
    return res.data.person;
  };

  const deletePerson = async (id: string) => {
    await api.delete(`/people/${id}`);
    setPeople(prev => prev.filter(p => p._id !== id));
  };

  useEffect(() => { fetchPeople(); }, []);

  return { people, loading, error, addPerson, deletePerson, fetchPeople };
};