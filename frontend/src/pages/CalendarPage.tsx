import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Star, Heart, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { useReminders } from '../hooks/useReminders';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const typeColors: Record<string, string> = {
  birthday: '#D4A96A',
  anniversary: '#9B7DC8',
  custom: '#4A7C3F',
  holiday: '#E07B6A',
};

export default function CalendarPage() {
  const { reminders, loading } = useReminders();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<number | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getRemindersForDay = (day: number) => {
    return reminders.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getDate() === day;
    });
  };

  const selectedReminders = selected ? getRemindersForDay(selected) : [];

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const upcomingThisMonth = reminders.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === month;
  });

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
          Calendar
        </h1>
        <p style={{ fontSize: 14, color: '#7A8A75' }}>
          {upcomingThisMonth.length} events in {MONTHS[month]}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Calendar */}
        <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E8E2DA' }}>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={prevMonth}
              style={{ width: 36, height: 36, borderRadius: 10, background: '#F7F4EF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A7C3F' }}>
              <ChevronLeft size={18} />
            </button>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18' }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth}
              style={{ width: 36, height: 36, borderRadius: 10, background: '#F7F4EF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A7C3F' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#8A9E85', padding: '8px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayReminders = getRemindersForDay(day);
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selected === day;

              return (
                <div key={day}
                  onClick={() => setSelected(isSelected ? null : day)}
                  style={{
                    aspectRatio: '1', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
                    background: isSelected ? '#2D5A27' : isToday ? '#EEF4EC' : 'transparent',
                    border: isToday && !isSelected ? '2px solid #4A7C3F' : '2px solid transparent',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F7F4EF'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? '#EEF4EC' : 'transparent'; }}
                >
                  <span style={{ fontSize: 14, fontWeight: isToday || isSelected ? 600 : 400, color: isSelected ? 'white' : isToday ? '#2D5A27' : '#1C3A18' }}>
                    {day}
                  </span>
                  {dayReminders.length > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                      {dayReminders.slice(0, 3).map((r, i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'white' : typeColors[r.type] }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 24, paddingTop: 20, borderTop: '1px solid #F0EBE3', flexWrap: 'wrap' }}>
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 12, color: '#7A8A75', textTransform: 'capitalize' }}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Selected day events */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E2DA' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#1C3A18', marginBottom: 16 }}>
              {selected ? `${MONTHS[month]} ${selected}` : 'Select a day'}
            </h3>
            {selected && selectedReminders.length === 0 && (
              <p style={{ fontSize: 13, color: '#7A8A75' }}>No events on this day</p>
            )}
            {selectedReminders.map(r => (
              <div key={r._id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #F0EBE3' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: typeColors[r.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {r.type === 'birthday' && <Star size={16} color={typeColors[r.type]} />}
                  {r.type === 'anniversary' && <Heart size={16} color={typeColors[r.type]} />}
                  {r.type === 'custom' && <Sparkles size={16} color={typeColors[r.type]} />}
                  {r.type === 'holiday' && <Bell size={16} color={typeColors[r.type]} />}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1C3A18' }}>{r.title}</p>
                  {r.personId && <p style={{ fontSize: 12, color: '#7A8A75' }}>{(r.personId as any).name}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* This month's events */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E2DA' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#1C3A18', marginBottom: 16 }}>
              This month
            </h3>
            {loading ? (
              <p style={{ fontSize: 13, color: '#7A8A75' }}>Loading...</p>
            ) : upcomingThisMonth.length === 0 ? (
              <p style={{ fontSize: 13, color: '#7A8A75' }}>No events this month</p>
            ) : (
              upcomingThisMonth
                .sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate())
                .map(r => (
                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F0EBE3' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: typeColors[r.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: typeColors[r.type] }}>
                        {new Date(r.date).getDate()}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1C3A18' }}>{r.title}</p>
                      {r.personId && <p style={{ fontSize: 11, color: '#7A8A75' }}>{(r.personId as any).name}</p>}
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[r.type] }} />
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}