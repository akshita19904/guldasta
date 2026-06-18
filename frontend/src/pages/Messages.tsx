import { useState } from 'react';
import { MessageCircle, Sparkles, Copy, Check, RefreshCw, ChevronDown } from 'lucide-react';
import Layout from '../components/Layout';
import { usePeople } from '../hooks/usePeople';
import api from '../utils/api';

const occasions = ['Birthday', 'Anniversary', 'Congratulations', 'Thank you', 'Just because', 'Get well soon', 'Farewell', 'Festival', 'Custom'];

const toneConfig = [
  { key: 'warm', label: 'Heartfelt', desc: 'Warm and emotional', color: '#D4A96A', bg: '#FBF5E8' },
  { key: 'funny', label: 'Playful', desc: 'Funny and witty', color: '#9B7DC8', bg: '#F5F0FB' },
  { key: 'poetic', label: 'Poetic', desc: 'Lyrical and beautiful', color: '#4A7C3F', bg: '#EEF4EC' },
  { key: 'short', label: 'Quick & Sweet', desc: 'Short and punchy', color: '#5B9EC9', bg: '#F0F7FB' },
];

interface GeneratedMessage {
  tone: string;
  label: string;
  message: string;
}

export default function Messages() {
  const { people } = usePeople();
  const [selectedPerson, setSelectedPerson] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualInterests, setManualInterests] = useState('');
  const [occasion, setOccasion] = useState('Birthday');
  const [extraContext, setExtraContext] = useState('');
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<number, string>>({});

  const person = people.find(p => p._id === selectedPerson);

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    setMessages([]);
    try {
      const res = await api.post('/messages/generate-all', {
        personName: person?.name || manualName || 'them',
        relationship: person?.relationship || 'friend',
        occasion,
        interests: person?.interests?.join(', ') || manualInterests,
        extraContext
      });
      setMessages(res.data.messages);
      setEditedTexts({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate messages');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getMessageText = (index: number, original: string) =>
    editedTexts[index] !== undefined ? editedTexts[index] : original;

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
          AI Message Composer
        </h1>
        <p style={{ fontSize: 14, color: '#7A8A75' }}>
          Write heartfelt messages in seconds — 4 different tones generated at once
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left panel */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E2DA', position: 'sticky', top: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#1C3A18', marginBottom: 6 }}>
            Compose for
          </h2>
          <p style={{ fontSize: 12, color: '#7A8A75', marginBottom: 20 }}>Person is optional</p>

          {/* Person from circle */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 8 }}>
              From my circle (optional)
            </label>
            <div style={{ position: 'relative' }}>
              <select value={selectedPerson}
                onChange={e => { setSelectedPerson(e.target.value); setManualName(''); setManualInterests(''); }}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: selectedPerson ? '#1C3A18' : '#8A9E85', fontSize: 13, outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                <option value="">Someone else...</option>
                {people.map(p => <option key={p._id} value={p._id}>{p.name} ({p.relationship})</option>)}
              </select>
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <ChevronDown size={15} color="#8A9E85" />
              </div>
            </div>
          </div>

          {/* Person preview */}
          {person && (
            <div style={{ background: '#EEF4EC', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#4A7C3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'white', flexShrink: 0 }}>
                {person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1C3A18', margin: 0 }}>{person.name}</p>
                <p style={{ fontSize: 11, color: '#4A7C3F', margin: 0 }}>{person.relationship}</p>
              </div>
            </div>
          )}

          {/* Manual entry */}
          {!selectedPerson && (
            <div style={{ marginBottom: 16, padding: 14, background: '#F7F4EF', borderRadius: 12, border: '1px dashed #C8D9C4' }}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#4A5E45', marginBottom: 6 }}>Their name</label>
                <input value={manualName} onChange={e => setManualName(e.target.value)}
                  placeholder="e.g. Priya"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #D4DEAD', background: 'white', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#4A5E45', marginBottom: 6 }}>Their vibe / personality</label>
                <input value={manualInterests} onChange={e => setManualInterests(e.target.value)}
                  placeholder="e.g. funny, loves travel, very emotional"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #D4DEAD', background: 'white', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {/* Occasion */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 8 }}>
              Occasion
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {occasions.map(o => (
                <button key={o} onClick={() => setOccasion(o)}
                  style={{ padding: '8px 6px', borderRadius: 9, border: `1.5px solid ${occasion === o ? '#4A7C3F' : '#E8E2DA'}`, background: occasion === o ? '#EEF4EC' : 'white', color: occasion === o ? '#2D5A27' : '#7A8A75', fontSize: 12, cursor: 'pointer', fontWeight: occasion === o ? 500 : 400, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Extra context */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 8 }}>
              Any extra context?
            </label>
            <textarea value={extraContext} onChange={e => setExtraContext(e.target.value)}
              placeholder="e.g. we've been friends for 10 years, she just got promoted..."
              rows={3}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }} />
          </div>

          {error && (
            <div style={{ background: '#FDF0EE', border: '1px solid #F0C5BE', color: '#A04030', fontSize: 13, padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#8A9E85' : 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
            {loading ? (
              <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Writing messages...</>
            ) : (
              <><Sparkles size={15} /> Generate 4 messages</>
            )}
          </button>
        </div>

        {/* Right — messages */}
        <div>
          {!messages.length && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: 20, border: '1px dashed #C8D9C4' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <MessageCircle size={32} color="#4A7C3F" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18', marginBottom: 8 }}>
                Write something meaningful
              </h3>
              <p style={{ fontSize: 14, color: '#7A8A75', lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
                Pick an occasion, tell us about the person, and get 4 beautiful messages in different styles — all at once.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: 20, border: '1px solid #E8E2DA' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Sparkles size={32} color="#4A7C3F" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1C3A18', marginBottom: 8 }}>
                Writing 4 beautiful messages...
              </h3>
              <p style={{ fontSize: 13, color: '#7A8A75' }}>This takes about 5 seconds</p>
            </div>
          )}

          {messages.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1C3A18', marginBottom: 4 }}>
                    Messages for {person?.name || manualName || 'them'}
                  </h2>
                  <p style={{ fontSize: 13, color: '#7A8A75' }}>{occasion} · 4 styles</p>
                </div>
                <button onClick={handleGenerate}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#EEF4EC', color: '#2D5A27', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  <RefreshCw size={14} /> Regenerate
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((msg, i) => {
                  const config = toneConfig.find(t => t.key === msg.tone) || toneConfig[0];
                  const text = getMessageText(i, msg.message);
                  const isEditing = editingIndex === i;
                  const isCopied = copiedIndex === i;

                  return (
                    <div key={i} style={{ background: 'white', borderRadius: 18, padding: 24, border: '1px solid #E8E2DA', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,90,39,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                      {/* Tone badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: config.bg, color: config.color, fontWeight: 600 }}>
                            {msg.label}
                          </span>
                          <span style={{ fontSize: 12, color: '#8A9E85' }}>{config.desc}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => {
                              if (isEditing) setEditingIndex(null);
                              else { setEditingIndex(i); setEditedTexts(prev => ({ ...prev, [i]: text })); }
                            }}
                            style={{ padding: '6px 12px', borderRadius: 8, background: isEditing ? '#EEF4EC' : '#F7F4EF', border: 'none', cursor: 'pointer', fontSize: 12, color: '#4A7C3F', fontFamily: "'DM Sans', sans-serif" }}>
                            {isEditing ? 'Done' : 'Edit'}
                          </button>
                          <button onClick={() => copyMessage(text, i)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, background: isCopied ? '#EEF4EC' : '#F7F4EF', border: 'none', cursor: 'pointer', fontSize: 12, color: isCopied ? '#4A7C3F' : '#4A5E45', fontFamily: "'DM Sans', sans-serif" }}>
                            {isCopied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                          </button>
                        </div>
                      </div>

                      {/* Message text */}
                      {isEditing ? (
                        <textarea
                          value={editedTexts[i]}
                          onChange={e => setEditedTexts(prev => ({ ...prev, [i]: e.target.value }))}
                          style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid #4A7C3F', background: '#F7F4EF', color: '#1C3A18', fontSize: 14, lineHeight: 1.7, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif', minHeight: '120px" }}
                          rows={5}
                        />
                      ) : (
                        <p style={{ fontSize: 14, color: '#1C3A18', lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
                          "{text}"
                        </p>
                      )}

                      {/* Share options */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0EBE3' }}>
                        <button onClick={() => copyMessage(text, i)}
                          style={{ flex: 1, padding: '9px', borderRadius: 10, background: '#EEF4EC', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2D5A27', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                          Copy for WhatsApp
                        </button>
                        <button onClick={() => {
                          const subject = encodeURIComponent(`${occasion} wishes`);
                          const body = encodeURIComponent(text);
                          window.open(`mailto:?subject=${subject}&body=${body}`);
                        }}
                          style={{ flex: 1, padding: '9px', borderRadius: 10, background: '#F7F4EF', border: 'none', cursor: 'pointer', fontSize: 12, color: '#4A5E45', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                          Open in Email
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}