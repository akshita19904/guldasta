import { useState } from 'react';
import { Bell, Plus, Trash2, Check, RefreshCw, Calendar, Heart, Star, Sparkles, ChevronLeft, ChevronRight, Gift, MessageCircle, LayoutList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useReminders } from '../hooks/useReminders';
import { usePeople } from '../hooks/usePeople';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  birthday: { color: '#D4A96A', bg: '#FBF5E8', label: 'Birthday' },
  anniversary: { color: '#9B7DC8', bg: '#F5F0FB', label: 'Anniversary' },
  custom: { color: '#4A7C3F', bg: '#EEF4EC', label: 'Custom' },
  holiday: { color: '#E07B6A', bg: '#FDF0EE', label: 'Holiday' },
};

export default function Celebrations() {
  const navigate = useNavigate();
  const { reminders, loading, addReminder, deleteReminder, toggleComplete, syncReminders , syncHolidays } = useReminders();
  const { people } = usePeople();

  const [view, setView] = useState<'timeline' | 'calendar'>('timeline');
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '', date: '', type: 'custom', description: '',
    remindDaysBefore: '7', personId: '', recurringYearly: true
  });

  const today = new Date();
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRemindersForDay = (day: number) => {
    return reminders.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getDate() === day;
    });
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

  const activeReminders = reminders.filter(r => !r.isCompleted)
    .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));

  const thisWeek = activeReminders.filter(r => getDaysUntil(r.date) <= 7);
  const thisMonth = activeReminders.filter(r => getDaysUntil(r.date) > 7 && getDaysUntil(r.date) <= 30);
  const later = activeReminders.filter(r => getDaysUntil(r.date) > 30);

  const selectedDayReminders = selectedDay ? getRemindersForDay(selectedDay) : [];
  const monthReminders = reminders.filter(r => new Date(r.date).getMonth() === month);

  const renderReminderCard = (reminder: any, accentBar = true) => {
    const days = getDaysUntil(reminder.date);
    const config = typeConfig[reminder.type];
    const isUrgent = days <= 7;

    return (
      <div key={reminder._id}
        style={{ background: 'white', borderRadius: 16, padding: '18px 20px', border: `1px solid ${isUrgent ? '#F0D5A0' : '#E8E2DA'}`, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
        {accentBar && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: config.color }} />
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingLeft: accentBar ? 10 : 0 }}>
          <div style={{ display: 'flex', gap: 12, flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {reminder.type === 'birthday' && <Star size={18} color={config.color} />}
              {reminder.type === 'anniversary' && <Heart size={18} color={config.color} />}
              {reminder.type === 'custom' && <Sparkles size={18} color={config.color} />}
              {reminder.type === 'holiday' && <Calendar size={18} color={config.color} />}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1C3A18', marginBottom: 2 }}>{reminder.title}</p>
              <p style={{ fontSize: 12, color: '#7A8A75', margin: 0 }}>
                {reminder.personId ? `${(reminder.personId as any).name} · ${(reminder.personId as any).relationship}` : config.label}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: isUrgent ? '#FBF5E8' : '#F7F4EF', color: isUrgent ? '#D4A96A' : '#8A9E85', fontWeight: 600 }}>
              {days} {days === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingLeft: accentBar ? 10 : 0 }}>
          <button onClick={() => navigate('/gifts')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#F7F4EF', border: 'none', cursor: 'pointer', fontSize: 11, color: '#4A5E45', fontFamily: "'DM Sans', sans-serif" }}>
            <Gift size={12} /> Gift ideas
          </button>
          <button onClick={() => navigate('/messages')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#F7F4EF', border: 'none', cursor: 'pointer', fontSize: 11, color: '#4A5E45', fontFamily: "'DM Sans', sans-serif" }}>
            <MessageCircle size={12} /> Write message
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={() => toggleComplete(reminder._id, true)}
            style={{ width: 28, height: 28, borderRadius: 8, background: 'white', border: '1.5px solid #E8E2DA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5B8A8' }}>
            <Check size={13} />
          </button>
          <button onClick={() => deleteReminder(reminder._id)}
            style={{ width: 28, height: 28, borderRadius: 8, background: 'white', border: '1.5px solid #E8E2DA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5B8A8' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
            Celebrations
          </h1>
          <p style={{ fontSize: 14, color: '#7A8A75' }}>
            {activeReminders.length} upcoming this {view === 'calendar' ? 'month' : 'period'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSync} disabled={syncing}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'white', color: '#4A7C3F', border: '1.5px solid #D4DEAD', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            <RefreshCw size={15} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            Sync circle
          </button>
          <button onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content', border: '1px solid #E8E2DA' }}>
        <button onClick={() => setView('timeline')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: view === 'timeline' ? 500 : 400, background: view === 'timeline' ? '#EEF4EC' : 'transparent', color: view === 'timeline' ? '#2D5A27' : '#7A8A75', fontFamily: "'DM Sans', sans-serif" }}>
          <LayoutList size={14} /> Timeline
        </button>
        <button onClick={() => setView('calendar')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: view === 'calendar' ? 500 : 400, background: view === 'calendar' ? '#EEF4EC' : 'transparent', color: view === 'calendar' ? '#2D5A27' : '#7A8A75', fontFamily: "'DM Sans', sans-serif" }}>
          <Calendar size={14} /> Month grid
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7A8A75' }}>Loading...</div>
      ) : reminders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bell size={28} color="#4A7C3F" />
          </div>
          <p style={{ fontSize: 16, color: '#1C3A18', fontWeight: 500, marginBottom: 6 }}>No celebrations yet</p>
          <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 20 }}>Add one or sync from your circle</p>
          <button onClick={handleSync}
            style={{ padding: '10px 20px', borderRadius: 10, background: '#EEF4EC', color: '#2D5A27', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Sync from circle
          </button>
        </div>
      ) : view === 'timeline' ? (
        /* TIMELINE VIEW */
        <div style={{ maxWidth: 680 }}>
          {thisWeek.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#D4A96A', marginBottom: 12 }}>
                This week
              </p>
              {thisWeek.map(r => renderReminderCard(r))}
            </div>
          )}
          {thisMonth.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#8A9E85', marginBottom: 12 }}>
                Later this month
              </p>
              {thisMonth.map(r => renderReminderCard(r))}
            </div>
          )}
          {later.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#8A9E85', marginBottom: 12 }}>
                Upcoming
              </p>
              {later.map(r => renderReminderCard(r))}
            </div>
          )}
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E8E2DA' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
                style={{ width: 36, height: 36, borderRadius: 10, background: '#F7F4EF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A7C3F' }}>
                <ChevronLeft size={18} />
              </button>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18' }}>
                {MONTHS[month]} {year}
              </h2>
              <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
                style={{ width: 36, height: 36, borderRadius: 10, background: '#F7F4EF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A7C3F' }}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#8A9E85', padding: '8px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayReminders = getRemindersForDay(day);
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const isSelected = selectedDay === day;

                return (
                  <div key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                    style={{
                      aspectRatio: '1', maxHeight: 56, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      background: isSelected ? '#2D5A27' : isToday ? '#EEF4EC' : 'transparent',
                      border: isToday && !isSelected ? '2px solid #4A7C3F' : '2px solid transparent',
                      transition: 'all 0.15s'
                    }}>
                    <span style={{ fontSize: 14, fontWeight: isToday || isSelected ? 600 : 400, color: isSelected ? 'white' : isToday ? '#2D5A27' : '#1C3A18' }}>
                      {day}
                    </span>
                    {dayReminders.length > 0 && (
                      <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {dayReminders.slice(0, 3).map((r, idx) => (
                          <div key={idx} style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'white' : typeConfig[r.type].color }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 24, paddingTop: 20, borderTop: '1px solid #F0EBE3', flexWrap: 'wrap' }}>
              {Object.entries(typeConfig).map(([type, cfg]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontSize: 12, color: '#7A8A75' }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E2DA' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#1C3A18', marginBottom: 16 }}>
                {selectedDay ? `${MONTHS[month]} ${selectedDay}` : 'Select a day'}
              </h3>
              {selectedDay && selectedDayReminders.length === 0 && (
                <p style={{ fontSize: 13, color: '#7A8A75' }}>No events on this day</p>
              )}
              {selectedDayReminders.map(r => renderReminderCard(r, false))}
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E2DA' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#1C3A18', marginBottom: 16 }}>
                This month
              </h3>
              {monthReminders.length === 0 ? (
                <p style={{ fontSize: 13, color: '#7A8A75' }}>No events this month</p>
              ) : (
                monthReminders.sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate()).map(r => (
                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F0EBE3' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: typeConfig[r.type].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: typeConfig[r.type].color }}>
                        {new Date(r.date).getDate()}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1C3A18', margin: 0 }}>{r.title}</p>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeConfig[r.type].color }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,58,24,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18', marginBottom: 6 }}>
              New celebration
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}