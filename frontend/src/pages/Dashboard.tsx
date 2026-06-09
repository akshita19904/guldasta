import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bell, Gift, Calendar, ChevronRight, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { usePeople } from '../hooks/usePeople';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { people, loading } = usePeople();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/people/stats').then(res => setStats(res.data.stats)).catch(() => {});
  }, []);

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = ['#4A7C3F', '#D4B978', '#6B9E5E', '#2D5A27', '#8A9E85', '#A8C5A0'];

  const statCards = [
    { label: 'People in circle', value: people.length, icon: <Users size={20} />, color: '#4A7C3F', bg: '#EEF4EC' },
    { label: 'Upcoming birthdays', value: stats?.upcomingBirthdays || 0, icon: <Bell size={20} />, color: '#D4A96A', bg: '#FBF5E8' },
    { label: 'This month', value: people.filter(p => p.birthday && getDaysUntil(p.birthday) <= 30).length, icon: <Calendar size={20} />, color: '#6B9E5E', bg: '#F0F6EE' },
    { label: 'Gift ideas ready', value: 0, icon: <Gift size={20} />, color: '#8A9E85', bg: '#F4F6F3' },
  ];

  const upcomingPeople = people
    .filter(p => p.birthday)
    .map(p => ({ ...p, daysUntil: getDaysUntil(p.birthday!) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
          {greeting}, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ fontSize: 14, color: '#7A8A75' }}>
          Here's what's happening with your circle
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #E8E2DA' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: 14 }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, color: '#1C3A18', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: '#7A8A75', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Recent people */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E8E2DA' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1C3A18' }}>
              Your Circle
            </h2>
            <button
              onClick={() => navigate('/people')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#4A7C3F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8A9E85', fontSize: 14 }}>Loading...</div>
          ) : people.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Users size={24} color="#4A7C3F" />
              </div>
              <p style={{ fontSize: 15, color: '#1C3A18', fontWeight: 500, marginBottom: 6 }}>No one added yet</p>
              <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 20 }}>Start by adding someone you care about</p>
              <button
                onClick={() => navigate('/people')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: '#2D5A27', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
              >
                <Plus size={16} /> Add someone
              </button>
            </div>
          ) : (
            people.slice(0, 6).map((person, i) => (
              <div key={person._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < Math.min(people.length, 6) - 1 ? '1px solid #F0EBE3' : 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 500, color: 'white', flexShrink: 0 }}>
                  {getInitials(person.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1C3A18', marginBottom: 2 }}>{person.name}</p>
                  <p style={{ fontSize: 12, color: '#7A8A75' }}>
                    {person.relationship}
                    {person.birthday && ` · Birthday in ${getDaysUntil(person.birthday)} days`}
                  </p>
                </div>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#EEF4EC', color: '#4A7C3F', fontWeight: 500 }}>
                  {person.relationship}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Upcoming birthdays */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E8E2DA' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1C3A18', marginBottom: 20 }}>
            Upcoming
          </h2>

          {upcomingPeople.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#7A8A75', fontSize: 13 }}>
              No upcoming birthdays
            </div>
          ) : (
            upcomingPeople.map((person, i) => (
              <div key={person._id} style={{ display: 'flex', gap: 14, paddingBottom: 16, marginBottom: 16, borderBottom: i < upcomingPeople.length - 1 ? '1px solid #F0EBE3' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'white', flexShrink: 0 }}>
                  {getInitials(person.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1C3A18', marginBottom: 2 }}>{person.name}</p>
                  <p style={{ fontSize: 12, color: '#7A8A75' }}>{person.relationship}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: person.daysUntil <= 7 ? '#D4A96A' : '#4A7C3F', fontFamily: "'Playfair Display', serif" }}>
                    {person.daysUntil}
                  </div>
                  <div style={{ fontSize: 11, color: '#7A8A75' }}>days</div>
                </div>
              </div>
            ))
          )}

          <button
            onClick={() => navigate('/people')}
            style={{ width: '100%', padding: '11px', borderRadius: 10, background: '#EEF4EC', color: '#2D5A27', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Plus size={15} /> Add someone new
          </button>
        </div>
      </div>
    </Layout>
  );
}