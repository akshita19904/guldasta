import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface GiftHistoryItem {
  _id: string;
  title: string;
  description: string;
  priceRange: string;
  category: string;
  occasion: string;
  createdAt: string;
}

export const useGiftHistory = (personId: string | null) => {
  const [history, setHistory] = useState<GiftHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!personId) {
      setHistory([]);
      return;
    }
    fetchHistory();
  }, [personId]);

  const fetchHistory = async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const res = await api.get(`/gifts/history/${personId}`);
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { history, loading, refetch: fetchHistory };
};