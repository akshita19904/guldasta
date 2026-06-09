import { useState } from 'react';
import { Plus, Trash2, Search, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { usePeople } from '../hooks/usePeople';

const relationships = ['Partner', 'Family', 'Best Friend', 'Friend', 'Colleague', 'Mentor', 'Other'];
const avatarColors = ['#4A7C3F', '#D4B978', '#6B9E5E', '#2D5A27', '#8A9E85', '#A8C5A0'];

export default function People() {
  const { people, loading, addPerson, deletePerson } = usePeople();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', relationship: 'Friend', birthday: '',
    anniversary: '', interests: '', notes: '', phone: '', email: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addPerson(form);
      setForm({ name: '', relationship: 'Friend', birthday: '', anniversary: '', interests: '', notes: '', phone: '', email: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filtered = people.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.relationship.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
            My Circle
          </h1>
          <p style={{ fontSize: 14, color: '#7A8A75' }}>{people.length} people you care about</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
        >
          <Plus size={17} /> Add person
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 360 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8A9E85' }}>
          <Search size={16} />
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search your circle..."
          style={{ width: '100%', padding: '11px 16px 11px 42px', borderRadius: 12, border: '1.5px solid #D4DEAD', background: 'white', color: '#1C3A18', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#4A7C3F'}
          onBlur={e => e.target.style.borderColor = '#D4DEAD'}
        />
      </div>

      {/* People grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7A8A75' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={28} color="#4A7C3F" />
          </div>
          <p style={{ fontSize: 16, color: '#1C3A18', fontWeight: 500, marginBottom: 6 }}>
            {search ? 'No results found' : 'Your circle is empty'}
          </p>
          <p style={{ fontSize: 13, color: '#7A8A75' }}>
            {search ? 'Try a different name' : 'Add someone you care about'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map((person, i) => (
            <div key={person._id} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E8E2DA', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,90,39,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 500, color: 'white' }}>
                  {getInitials(person.name)}
                </div>
                <button
                  onClick={() => deletePerson(person._id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C5B8A8', padding: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C0392B')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#C5B8A8')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#1C3A18', marginBottom: 4 }}>{person.name}</p>
              <p style={{ fontSize: 12, color: '#7A8A75', marginBottom: 12 }}>{person.relationship}</p>
              {person.birthday && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#F7F4EF' }}>
                  <span style={{ fontSize: 12, color: '#7A8A75' }}>Birthday</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: getDaysUntil(person.birthday) <= 7 ? '#D4A96A' : '#4A7C3F' }}>
                    {getDaysUntil(person.birthday)} days
                  </span>
                </div>
              )}
              {person.interests && person.interests.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                  {person.interests.slice(0, 2).map((interest, j) => (
                    <span key={j} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#EEF4EC', color: '#4A7C3F' }}>
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Person Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,58,24,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18', marginBottom: 6 }}>
              Add someone special
            </h2>
            <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 24 }}>
              Keep track of the people who matter most
            </p>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full name *', key: 'name', type: 'text', placeholder: 'e.g. Priya Sharma' },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'their@email.com' },
                { label: 'Birthday', key: 'birthday', type: 'date', placeholder: '' },
                { label: 'Anniversary', key: 'anniversary', type: 'date', placeholder: '' },
                { label: 'Interests (comma separated)', key: 'interests', type: 'text', placeholder: 'travel, books, coffee' },
                { label: 'Notes', key: 'notes', type: 'text', placeholder: 'Loves surprises...' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.key === 'name'}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>
                  Relationship *
                </label>
                <select
                  value={form.relationship}
                  onChange={e => setForm({ ...form, relationship: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none' }}
                >
                  {relationships.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: '#F7F4EF', color: '#7A8A75', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  {submitting ? 'Adding...' : 'Add to circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}