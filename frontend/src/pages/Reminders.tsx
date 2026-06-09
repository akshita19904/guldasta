import { useState } from 'react';
import { Bell, Plus, Trash2, Check, RefreshCw, Calendar, Heart, Star, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { useReminders } from '../hooks/useReminders';
import { usePeople } from '../hooks/usePeople';

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  birthday: { color: '#D4A96A', bg: '#FBF5E8', label: 'Birthday' },
  anniversary: { color: '#9B7DC8', bg: '#F5F0FB', label: 'Anniversary' },
  custom: { color: '#4A7C3F', bg: '#EEF4EC', label: 'Custom' },
  holiday: { color: '#E07B6A', bg: '#FDF0EE', label: 'Holiday' },
};

export default function Reminders() {
  const { reminders, loading, addReminder, deleteReminder, toggleComplete, syncReminders } = useReminders();
  const { people } = usePeople();
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [form, setForm] = useState({
    title: '', date: '', type: 'custom', description: '',
    remindDaysBefore: '7', personId: '', recurringYearly: true
  });

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncReminders();
    setSyncing(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReminder(form);
    setForm({ title: '', date: '', type: 'custom', description: '', remindDaysBefore: '7', personId: '', recurringYearly: true });
    setShowForm(false);
  };

  const filtered = reminders.filter(r => {
    if (filter === 'completed') return r.isCompleted;
    if (filter === 'upcoming') return !r.isCompleted;
    return true;
  }).sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));

  const urgent = reminders.filter(r => !r.isCompleted && getDaysUntil(r.date) <= 7);

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
            Reminders
          </h1>
          <p style={{ fontSize: 14, color: '#7A8A75' }}>
            {reminders.filter(r => !r.isCompleted).length} upcoming celebrations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'white', color: '#4A7C3F', border: '1.5px solid #D4DEAD', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
          >
            <RefreshCw size={15} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            Sync from circle
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
          >
            <Plus size={16} /> Add reminder
          </button>
        </div>
      </div>

      {/* Urgent alert */}
      {urgent.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #FBF5E8, #FDF0EE)', border: '1px solid #F0D5A0', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#D4A96A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#8B5E17', marginBottom: 2 }}>
              {urgent.length} celebration{urgent.length > 1 ? 's' : ''} coming up this week!
            </p>
            <p style={{ fontSize: 13, color: '#A07830' }}>
              {urgent.map(r => r.title).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content', border: '1px solid #E8E2DA' }}>
        {(['upcoming', 'all', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: filter === f ? 500 : 400, background: filter === f ? '#EEF4EC' : 'transparent', color: filter === f ? '#2D5A27' : '#7A8A75', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Reminders list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7A8A75' }}>Loading reminders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bell size={28} color="#4A7C3F" />
          </div>
          <p style={{ fontSize: 16, color: '#1C3A18', fontWeight: 500, marginBottom: 6 }}>No reminders yet</p>
          <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 20 }}>Add one or sync from your circle</p>
          <button onClick={handleSync}
            style={{ padding: '10px 20px', borderRadius: 10, background: '#EEF4EC', color: '#2D5A27', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Sync from circle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(reminder => {
            const days = getDaysUntil(reminder.date);
            const config = typeConfig[reminder.type];
            const isUrgent = days <= 7 && !reminder.isCompleted;
            return (
              <div key={reminder._id}
                style={{ background: 'white', borderRadius: 16, padding: '20px 24px', border: `1px solid ${isUrgent ? '#F0D5A0' : '#E8E2DA'}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', opacity: reminder.isCompleted ? 0.6 : 1, boxShadow: isUrgent ? '0 4px 20px rgba(212,169,106,0.15)' : 'none' }}>

                {/* Type indicator */}
                <div style={{ width: 48, height: 48, borderRadius: 14, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {reminder.type === 'birthday' && <Star size={22} color={config.color} />}
                  {reminder.type === 'anniversary' && <Heart size={22} color={config.color} />}
                  {reminder.type === 'custom' && <Sparkles size={22} color={config.color} />}
                  {reminder.type === 'holiday' && <Calendar size={22} color={config.color} />}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: reminder.isCompleted ? '#7A8A75' : '#1C3A18', textDecoration: reminder.isCompleted ? 'line-through' : 'none' }}>
                      {reminder.title}
                    </p>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: config.bg, color: config.color, fontWeight: 500 }}>
                      {config.label}
                    </span>
                  </div>
                  {reminder.personId && (
                    <p style={{ fontSize: 12, color: '#7A8A75' }}>
                      {(reminder.personId as any).name} · {(reminder.personId as any).relationship}
                    </p>
                  )}
                  {reminder.description && (
                    <p style={{ fontSize: 12, color: '#8A9E85', marginTop: 2 }}>{reminder.description}</p>
                  )}
                </div>

                {/* Days counter */}
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: isUrgent ? '#D4A96A' : days <= 30 ? '#4A7C3F' : '#8A9E85', lineHeight: 1 }}>
                    {days}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A9E85', marginTop: 2 }}>days away</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => toggleComplete(reminder._id, !reminder.isCompleted)}
                    style={{ width: 34, height: 34, borderRadius: 10, background: reminder.isCompleted ? '#EEF4EC' : 'white', border: `1.5px solid ${reminder.isCompleted ? '#4A7C3F' : '#E8E2DA'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: reminder.isCompleted ? '#4A7C3F' : '#C5B8A8' }}
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder._id)}
                    style={{ width: 34, height: 34, borderRadius: 10, background: 'white', border: '1.5px solid #E8E2DA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5B8A8' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C0392B')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#C5B8A8')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,58,24,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18', marginBottom: 6 }}>
              New reminder
            </h2>
            <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 24 }}>Never miss a meaningful moment</p>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Priya's Birthday" required
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none' }}>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="holiday">Holiday</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>Link to person (optional)</label>
                <select value={form.personId} onChange={e => setForm({ ...form, personId: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none' }}>
                  <option value="">None</option>
                  {people.map(p => <option key={p._id} value={p._id}>{p.name} ({p.relationship})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>Remind me</label>
                <select value={form.remindDaysBefore} onChange={e => setForm({ ...form, remindDaysBefore: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none' }}>
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">7 days before</option>
                  <option value="14">14 days before</option>
                  <option value="30">1 month before</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>Notes</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Any special notes..."
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="recurring" checked={form.recurringYearly} onChange={e => setForm({ ...form, recurringYearly: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: '#4A7C3F' }} />
                <label htmlFor="recurring" style={{ fontSize: 13, color: '#4A5E45', cursor: 'pointer' }}>Repeat every year</label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: '#F7F4EF', color: '#7A8A75', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Save reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}