import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Leaf, Gift, Calendar, MessageCircle, Star } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: <Calendar size={15} />, title: 'Smart reminders', desc: 'Never miss a birthday again' },
    { icon: <Gift size={15} />, title: 'AI gift ideas', desc: 'Personalised for each person' },
    { icon: <MessageCircle size={15} />, title: 'Heartfelt messages', desc: 'Written by AI, felt by heart' },
    { icon: <Star size={15} />, title: 'Your circle', desc: 'All loved ones in one place' },
  ];

  const fields = [
    { label: 'Full name', type: 'text', value: name, setter: setName, placeholder: 'Your full name', icon: <User size={16} /> },
    { label: 'Email address', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com', icon: <Mail size={16} /> },
    { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: 'Min. 6 characters', icon: <Lock size={16} /> },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'DM Sans', sans-serif", background:'#F7F4EF' }}>

      {/* Left Panel */}
      <div style={{
        width:'45%',
        background:'linear-gradient(145deg, #1C3A18 0%, #2D5A27 30%, #4A7C3F 65%, #6B9E5E 100%)',
        padding:'48px 44px',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        position:'relative',
        overflow:'hidden',
      }} className="hidden lg:flex">

        <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.05)', top:-80, right:-60 }}></div>
        <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', background:'rgba(212,185,120,0.15)', bottom:20, left:-40 }}></div>

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Leaf size={20} color="white" />
            </div>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:26, color:'white' }}>
              Gul<em style={{ color:'#D4B978' }}>dasta</em>
            </span>
          </div>
          <p style={{ fontSize:11, letterSpacing:2.5, textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:40 }}>
            Relationship Assistant
          </p>

          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:30, color:'white', lineHeight:1.35, marginBottom:12 }}>
            Your circle of<br /><em>loved ones awaits</em>
          </h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.7, marginBottom:40 }}>
            Join thousands who never miss what matters most — birthdays, anniversaries, and all the moments in between.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {perks.map((p, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(212,185,120,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4B978', flexShrink:0 }}>
                  {p.icon}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'white', marginBottom:2 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)' }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:34, color:'#1C3A18' }}>
              Gul<em style={{ color:'#4A7C3F' }}>dasta</em>
            </div>
            <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#8A9E85', marginTop:4 }}>
              Create your account
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:10 }}>
              {['#2D5A27','#6B9E5E','#D4B978','#A8C5A0'].map((c,i) => (
                <div key={i} style={{ width:20, height:3, borderRadius:2, background:c }}></div>
              ))}
            </div>
          </div>

          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:24, color:'#1C3A18', marginBottom:4 }}>
            Join Guldasta
          </h2>
          <p style={{ fontSize:13, color:'#7A8A75', marginBottom:24 }}>
            Start celebrating the people you love
          </p>

          {error && (
            <div style={{ background:'#F0F7EE', border:'1px solid #B5CEB0', color:'#2D5A27', fontSize:13, padding:'12px 16px', borderRadius:12, marginBottom:20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.label} style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:1, color:'#4A5E45', marginBottom:8 }}>
                  {field.label}
                </label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#8A9E85' }}>
                    {field.icon}
                  </div>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    required
                    style={{ width:'100%', padding:'13px 16px 13px 42px', borderRadius:12, border:'1.5px solid #D4DEAD', background:'#FDFCFA', color:'#1C3A18', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:"'DM Sans', sans-serif", transition:'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#4A7C3F'}
                    onBlur={e => e.target.style.borderColor = '#D4DEAD'}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%',
                padding:'14px',
                borderRadius:12,
                border:'none',
                background: loading ? '#8A9E85' : 'linear-gradient(135deg, #2D5A27 0%, #4A7C3F 100%)',
                color:'white',
                fontSize:15,
                fontWeight:500,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily:"'DM Sans', sans-serif",
                marginTop:8,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                gap:8,
                transition:'all 0.2s'
              }}
            >
              {loading ? 'Creating account...' : (
                <>
                  <Leaf size={16} />
                  Create my account
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'#7A8A75', marginTop:24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#2D5A27', fontWeight:500, textDecoration:'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}