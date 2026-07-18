import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Sparkles, BookmarkPlus, Bookmark, ChevronDown, Loader, Tag, Heart, History } from 'lucide-react';
import Layout from '../components/Layout';
import { usePeople } from '../hooks/usePeople';
import { useGiftHistory } from '../hooks/useGiftHistory';
import { saveCachedResult, getCachedResult } from '../utils/cacheStorage';
import api from '../utils/api';

const categoryIcons: Record<string, string> = {
  Experience: '✦', Tech: '⬡', Wellness: '◈', Books: '▣',
  Food: '◉', Fashion: '◆', Home: '⬟', Art: '◇', Hobby: '⬠',
  Bouquets: '✿', Hampers: '◫', Cakes: '◍', Experiences: '✦', Personalised: '◈', Plants: '❀', Combos: '◆'
};

const categoryColors: Record<string, { bg: string; color: string }> = {
  Experience: { bg: '#FBF5E8', color: '#D4A96A' },
  Tech: { bg: '#EEF4EC', color: '#4A7C3F' },
  Wellness: { bg: '#F5F0FB', color: '#9B7DC8' },
  Books: { bg: '#FDF0EE', color: '#E07B6A' },
  Food: { bg: '#FBF5E8', color: '#D4A96A' },
  Fashion: { bg: '#F0F7FB', color: '#5B9EC9' },
  Home: { bg: '#EEF4EC', color: '#4A7C3F' },
  Art: { bg: '#F5F0FB', color: '#9B7DC8' },
  Hobby: { bg: '#FDF0EE', color: '#E07B6A' },
  Bouquets: { bg: '#FDF0EE', color: '#E07B6A' },
  Hampers: { bg: '#FBF5E8', color: '#D4A96A' },
  Cakes: { bg: '#F5F0FB', color: '#9B7DC8' },
  Experiences: { bg: '#EEF4EC', color: '#4A7C3F' },
  Personalised: { bg: '#F0F7FB', color: '#5B9EC9' },
  Plants: { bg: '#EEF4EC', color: '#4A7C3F' },
  Combos: { bg: '#FDF0EE', color: '#E07B6A' },
};

interface GiftIdea {
  productId: string;
  name: string;
  price: number;
  category: string;
  isCustomizable: boolean;
  whyPerfect: string;
}

export default function Gifts() {
  const navigate = useNavigate();
  const { people } = usePeople();
  const [selectedPerson, setSelectedPerson] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualInterests, setManualInterests] = useState('');
  const [occasion, setOccasion] = useState('Birthday');
  const [budget, setBudget] = useState('₹500-₹2000');
  const [extraContext, setExtraContext] = useState('');
  const [gifts, setGifts] = useState<GiftIdea[]>(() => getCachedResult('guldasta_last_gifts') || []);
  const [savedGifts, setSavedGifts] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [personName, setPersonName] = useState(() => getCachedResult('guldasta_last_person_name') || '');
  const [showSaved, setShowSaved] = useState(false);
  const [dbSavedGifts, setDbSavedGifts] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const person = people.find(p => p._id === selectedPerson);
  const { history } = useGiftHistory(selectedPerson || null);

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    setGifts([]);
    setSavedGifts(new Set());
    try {
      const res = await api.post('/gifts/generate', {
        personId: selectedPerson || null,
        manualName,
        manualInterests,
        occasion,
        budget,
        extraContext
      });

      if (res.data.gifts.length === 0 && res.data.message) {
  setError(res.data.message);
} else {
  setGifts(res.data.gifts);
  saveCachedResult('guldasta_last_gifts', res.data.gifts);
}
      setPersonName(res.data.person?.name || manualName || 'them');
      saveCachedResult('guldasta_last_person_name', res.data.person?.name || manualName || 'them');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate gifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (gift: GiftIdea, index: number) => {
    try {
      await api.post('/gifts/save', {
        personId: selectedPerson || null,
        productId: gift.productId,
        name: gift.name,
        price: gift.price,
        category: gift.category,
        occasion
      });
      setSavedGifts(prev => new Set([...prev, index]));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSaved = async () => {
    setLoadingSaved(true);
    try {
      const res = await api.get('/gifts/saved');
      setDbSavedGifts(res.data.gifts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const toggleSaved = () => {
    if (!showSaved) fetchSaved();
    setShowSaved(!showSaved);
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
            AI Gift Ideas
          </h1>
          <p style={{ fontSize: 14, color: '#7A8A75' }}>
            Personalised gift suggestions — no account needed for the recipient
          </p>
        </div>
        <button onClick={toggleSaved}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: showSaved ? '#2D5A27' : 'white', color: showSaved ? 'white' : '#4A7C3F', border: '1.5px solid #D4DEAD', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          <Bookmark size={15} />
          Saved gifts
        </button>
      </div>

      {/* Saved gifts view */}
      {showSaved ? (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1C3A18', marginBottom: 20 }}>
            Your saved gifts
          </h2>
          {loadingSaved ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#7A8A75' }}>Loading...</div>
          ) : dbSavedGifts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Bookmark size={24} color="#4A7C3F" />
              </div>
              <p style={{ fontSize: 15, color: '#1C3A18', fontWeight: 500 }}>No saved gifts yet</p>
              <p style={{ fontSize: 13, color: '#7A8A75', marginTop: 6 }}>Generate ideas and save your favourites</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {dbSavedGifts.map((gift, i) => {
                const colors = categoryColors[gift.category] || categoryColors.Experience;
                return (
                  <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E8E2DA' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: colors.bg, color: colors.color, fontWeight: 500 }}>
                        {gift.category}
                      </span>
                      <span style={{ fontSize: 12, color: '#7A8A75' }}>{(gift.personId as any)?.name || 'General'}</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1C3A18', marginBottom: 8 }}>{gift.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={13} color="#4A7C3F" />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#4A7C3F' }}>{gift.priceRange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Control panel */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E2DA', position: 'sticky', top: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#1C3A18', marginBottom: 6 }}>
              Generate ideas for
            </h2>
            <p style={{ fontSize: 12, color: '#7A8A75', marginBottom: 20 }}>
              Adding a person is optional
            </p>

            {/* Person selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 8 }}>
                From my circle (optional)
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedPerson}
                  onChange={e => {
                    setSelectedPerson(e.target.value);
                    setManualName('');
                    setManualInterests('');
                  }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: selectedPerson ? '#1C3A18' : '#8A9E85', fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Someone not in my circle...</option>
                  {people.map(p => <option key={p._id} value={p._id}>{p.name} ({p.relationship})</option>)}
                </select>
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <ChevronDown size={16} color="#8A9E85" />
                </div>
              </div>
            </div>

            {/* Person preview + gift history */}
            {person && (
              <>
                <div style={{ background: '#EEF4EC', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4A7C3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'white', flexShrink: 0 }}>
                    {person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1C3A18' }}>{person.name}</p>
                    <p style={{ fontSize: 11, color: '#4A7C3F' }}>
                      {person.interests?.slice(0, 2).join(', ') || 'No interests added'}
                    </p>
                  </div>
                </div>

                {history.length > 0 && (
                  <div style={{ marginBottom: 16, padding: '12px 14px', background: '#FBF5E8', borderRadius: 12, border: '1px solid #F0E0BE' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <History size={13} color="#D4A96A" />
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: '#8B5E17', margin: 0 }}>
                        Gifts already given ({history.length})
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {history.slice(0, 3).map(item => (
                        <div key={item._id} style={{ fontSize: 12, color: '#6B5030' }}>
                          • {item.title} <span style={{ color: '#A07830' }}>({item.occasion})</span>
                        </div>
                      ))}
                      {history.length > 3 && (
                        <p style={{ fontSize: 11, color: '#A07830', margin: 0 }}>+{history.length - 3} more</p>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: '#8B5E17', marginTop: 8, marginBottom: 0, fontStyle: 'italic' }}>
                      AI will avoid repeating these
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Manual entry */}
            {!selectedPerson && (
              <div style={{ marginBottom: 16, padding: 14, background: '#F7F4EF', borderRadius: 12, border: '1px dashed #C8D9C4' }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 12 }}>
                  Or tell us about them
                </p>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11, color: '#4A5E45', marginBottom: 6 }}>
                    Their name (optional)
                  </label>
                  <input
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="e.g. Rahul, my college friend"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: 'white', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#4A5E45', marginBottom: 6 }}>
                    Their interests (optional)
                  </label>
                  <input
                    value={manualInterests}
                    onChange={e => setManualInterests(e.target.value)}
                    placeholder="e.g. cricket, gaming, coffee"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: 'white', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {/* Occasion */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 8 }}>
                Occasion
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['Birthday', 'Anniversary', 'Just because', 'Festival', 'Graduation', 'Custom'].map(o => (
                  <button key={o} onClick={() => setOccasion(o)}
                    style={{ padding: '8px', borderRadius: 10, border: `1.5px solid ${occasion === o ? '#4A7C3F' : '#E8E2DA'}`, background: occasion === o ? '#EEF4EC' : 'white', color: occasion === o ? '#2D5A27' : '#7A8A75', fontSize: 12, cursor: 'pointer', fontWeight: occasion === o ? 500 : 400, transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 8 }}>
                Budget
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Under ₹500', '₹500-₹2000', '₹2000-₹5000', '₹5000-₹10000', '₹10000+'].map(b => (
                  <button key={b} onClick={() => setBudget(b)}
                    style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${budget === b ? '#4A7C3F' : '#E8E2DA'}`, background: budget === b ? '#EEF4EC' : 'white', color: budget === b ? '#2D5A27' : '#7A8A75', fontSize: 13, cursor: 'pointer', fontWeight: budget === b ? 500 : 400, textAlign: 'left', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra context */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 8 }}>
                Any special requests?
              </label>
              <textarea
                value={extraContext}
                onChange={e => setExtraContext(e.target.value)}
                placeholder="e.g. she loves minimalist things, avoid sweets, something eco-friendly..."
                rows={3}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {error && (
              <div style={{ background: '#FDF0EE', border: '1px solid #F0C5BE', color: '#A04030', fontSize: 13, padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#8A9E85' : 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating ideas...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate gift ideas
                </>
              )}
            </button>
          </div>

          {/* Results */}
          <div>
            {!gifts.length && !loading && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: 20, border: '1px dashed #C8D9C4' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Gift size={32} color="#4A7C3F" />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18', marginBottom: 8 }}>
                  Find the perfect gift
                </h3>
                <p style={{ fontSize: 14, color: '#7A8A75', lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
                  Pick an occasion and budget — adding a person is completely optional. Just tell us a bit about them and let AI do the rest.
                </p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: 20, border: '1px solid #E8E2DA' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Sparkles size={32} color="#4A7C3F" />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1C3A18', marginBottom: 8 }}>
                  Finding perfect gifts{personName ? ` for ${personName}` : ''}...
                </h3>
                <p style={{ fontSize: 13, color: '#7A8A75' }}>
                  AI is thinking about their personality and interests
                </p>
              </div>
            )}

            {gifts.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1C3A18', marginBottom: 4 }}>
                      Gift ideas{personName ? ` for ${personName}` : ''}
                    </h2>
                    <p style={{ fontSize: 13, color: '#7A8A75' }}>{occasion} · {budget}</p>
                  </div>
                  <button onClick={handleGenerate}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#EEF4EC', color: '#2D5A27', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                    <Sparkles size={14} /> Regenerate
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {gifts.map((gift, i) => {
                    const colors = categoryColors[gift.category] || categoryColors.Experience;
                    const isSaved = savedGifts.has(i);
                    return (
                      <div key={i}
                        style={{ background: 'white', borderRadius: 18, padding: 22, border: `1px solid ${isSaved ? '#4A7C3F' : '#E8E2DA'}`, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(45,90,39,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {isSaved && (
                          <div style={{ position: 'absolute', top: 0, right: 0, background: '#4A7C3F', padding: '4px 12px', borderRadius: '0 18px 0 12px', fontSize: 11, color: 'white', fontWeight: 500 }}>
                            Saved
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: colors.color }}>
                            {categoryIcons[gift.category] || '◆'}
                          </div>
                          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: colors.bg, color: colors.color, fontWeight: 500 }}>
                            {gift.category}
                          </span>
                          {gift.isCustomizable && (
                            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: '#FBF5E8', color: '#D4A96A', fontWeight: 500 }}>
                              ✨ Customizable
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1C3A18', marginBottom: 8, lineHeight: 1.3 }}>
                          {gift.name}
                        </h3>

                        <div style={{ background: '#F7F4EF', borderRadius: 10, padding: '10px 12px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <Heart size={13} color="#D4A96A" style={{ marginTop: 2, flexShrink: 0 }} />
                          <p style={{ fontSize: 12, color: '#6B5030', lineHeight: 1.5, margin: 0 }}>{gift.whyPerfect}</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ fontSize: 17, fontWeight: 600, color: '#2D5A27', fontFamily: "'Playfair Display', serif" }}>₹{gift.price}</span>
                          <button
                            onClick={() => handleSave(gift, i)}
                            disabled={isSaved}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: isSaved ? '#EEF4EC' : 'white', border: `1.5px solid ${isSaved ? '#4A7C3F' : '#E8E2DA'}`, color: isSaved ? '#4A7C3F' : '#7A8A75', fontSize: 12, fontWeight: 500, cursor: isSaved ? 'default' : 'pointer' }}>
                            {isSaved ? <Bookmark size={13} /> : <BookmarkPlus size={13} />}
                            {isSaved ? 'Saved' : 'Save'}
                          </button>
                        </div>

                        <button
                          onClick={() => navigate(gift.isCustomizable ? `/customize/${gift.productId}` : `/store?highlight=${gift.productId}`)}
                          style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                         {gift.isCustomizable ? 'Customize & Order →' : 'View in Store →'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}