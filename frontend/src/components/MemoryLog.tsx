import { useState } from 'react';
import { Plus, X, Sparkles, Star, Clock } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';

const tagConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  preference: { color: '#D4A96A', bg: '#FBF5E8', icon: Sparkles, label: 'Preference' },
  milestone: { color: '#9B7DC8', bg: '#F5F0FB', icon: Star, label: 'Milestone' },
  memory: { color: '#4A7C3F', bg: '#EEF4EC', icon: Clock, label: 'Memory' },
};

export default function MemoryLog({ personId }: { personId: string }) {
  const { notes, loading, addNote, deleteNote } = useNotes(personId);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<'preference' | 'milestone' | 'memory'>('memory');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await addNote(content.trim(), tag);
    setContent('');
    setShowForm(false);
  };

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E8E2DA' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#1C3A18', margin: 0 }}>
          Memory log
        </h3>
        <button onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: '#EEF4EC', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2D5A27', fontWeight: 500 }}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'Add note'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ marginBottom: 16, padding: 14, background: '#F7F4EF', borderRadius: 12 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="e.g. mentioned wanting an iPad in March..."
            rows={2}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: 'white', color: '#1C3A18', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}
          />
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['memory', 'preference', 'milestone'] as const).map(t => {
              const config = tagConfig[t];
              return (
                <button key={t} type="button" onClick={() => setTag(t)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${tag === t ? config.color : '#E8E2DA'}`, background: tag === t ? config.bg : 'white', color: tag === t ? config.color : '#7A8A75', fontSize: 11, cursor: 'pointer', fontWeight: tag === t ? 500 : 400, fontFamily: "'DM Sans', sans-serif" }}>
                  {config.label}
                </button>
              );
            })}
          </div>
          <button type="submit"
            style={{ width: '100%', padding: 10, borderRadius: 9, background: '#2D5A27', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Save note
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: '#7A8A75' }}>Loading...</p>
      ) : notes.length === 0 ? (
        <p style={{ fontSize: 13, color: '#8A9E85' }}>No notes yet. Add little things you notice — they help AI suggest better gifts.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notes.map(note => {
            const config = tagConfig[note.tag];
            const Icon = config.icon;
            return (
              <div key={note._id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#F7F4EF', borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} color={config.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#1C3A18', margin: 0, lineHeight: 1.5 }}>{note.content}</p>
                  <p style={{ fontSize: 11, color: '#8A9E85', margin: '4px 0 0' }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => deleteNote(note._id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C5B8A8', padding: 2 }}>
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}