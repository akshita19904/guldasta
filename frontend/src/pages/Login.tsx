import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Leaf, Gift, Heart, MessageCircle, Calendar } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Calendar size={14} />, label: 'Birthdays & anniversaries' },
    { icon: <Gift size={14} />, label: 'AI gift suggestions' },
    { icon: <MessageCircle size={14} />, label: 'Heartfelt messages' },
    { icon: <Heart size={14} />, label: 'Your circle of care' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'DM Sans', sans-serif",
      background: '#F7F4EF'
    }}>
      {/* Left Panel */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(145deg, #2D5A27 0%, #4A7C3F 35%, #6B9E5E 70%, #A8C5A0 100%)',
        padding: '48px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden lg:flex">

        {/* Decorative blobs */}
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.06)', top:-60, right:-60 }}></div>
        <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(212,185,120,0.2)', bottom:40, left:-30 }}></div>
        <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.08)', bottom:120, right:30 }}></div>

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Leaf size={20} color="white" />
            </div>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:26, color:'white', letterSpacing:-0.5 }}>
              Gul<em style={{ color:'#D4B978' }}>dasta</em>
            </span>
          </div>
          <p style={{ fontSize:11, letterSpacing:2.5, textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:40 }}>
            Relationship Assistant
          </p>

          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:32, color:'white', lineHeight:1.3, marginBottom:14 }}>
            Celebrate the people<br />
            <em>you love most</em>
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:36, maxWidth:300 }}>
            Never miss a birthday, anniversary or milestone again. Your personal AI-powered circle of care.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.85)' }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom accent bar */}
          <div style={{ display:'flex', gap:6, marginTop:48 }}>
            {['#2D5A27','#6B9E5E','#D4B978','#A8C5A0'].map((c,i) => (
              <div key={i} style={{ flex:1, height:3, borderRadius:2, background:c, opacity: i===1 ? 1 : 0.5 }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          {/* Logo for mobile */}
          <div style={{ textAlign:'center', marginBottom:36 }} className="lg:hidden">
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:36, color:'#1C3A18' }}>
              Gul<em style={{ color:'#4A7C3F' }}>dasta</em>
            </div>
            <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#8A9E85', marginTop:4 }}>
              Relationship Assistant
            </p>
          </div>

          {/* Accent dots */}
          <div style={{ display:'flex', gap:6, marginBottom:28, justifyContent:'center' }} className="hidden lg:flex">
            {['#2D5A27','#6B9E5E','#D4B978','#A8C5A0'].map((c,i) => (
              <div key={i} style={{ width:24, height:3, borderRadius:2, background:c }}></div>
            ))}
          </div>

          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:28, color:'#1C3A18', marginBottom:4 }}>
            Welcome back
          </h2>
          <p style={{ fontSize:13, color:'#7A8A75', marginBottom:28 }}>
            Sign in to your account
          </p>

          {error && (
            <div style={{ background:'#F0F7EE', border:'1px solid #B5CEB0', color:'#2D5A27', fontSize:13, padding:'12px 16px', borderRadius:12, marginBottom:20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:1, color:'#4A5E45', marginBottom:8 }}>
                Email address
              </label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#8A9E85' }}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ width:'100%', padding:'13px 16px 13px 42px', borderRadius:12, border:'1.5px solid #D4DEAD', background:'#FDFCFA', color:'#1C3A18', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:"'DM Sans', sans-serif", transition:'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#4A7C3F'}
                  onBlur={e => e.target.style.borderColor = '#D4DEAD'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:1, color:'#4A5E45', marginBottom:8 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#8A9E85' }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width:'100%', padding:'13px 42px 13px 42px', borderRadius:12, border:'1.5px solid #D4DEAD', background:'#FDFCFA', color:'#1C3A18', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:"'DM Sans', sans-serif", transition:'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#4A7C3F'}
                  onBlur={e => e.target.style.borderColor = '#D4DEAD'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#8A9E85', padding:0 }}
                >
                  {showPass ? <Lock size={15} /> : <Lock size={15} />}
                </button>
              </div>
            </div>

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
                letterSpacing:0.3,
                transition:'all 0.2s',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                gap:8
              }}
            >
              {loading ? 'Signing in...' : (
                <>
                  <Leaf size={16} />
                  Sign in to Guldasta
                </>
              )}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'#E4DDD4' }}></div>
            <span style={{ fontSize:12, color:'#A0927E' }}>or</span>
            <div style={{ flex:1, height:1, background:'#E4DDD4' }}></div>
          </div>

          <p style={{ textAlign:'center', fontSize:13, color:'#7A8A75' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#2D5A27', fontWeight:500, textDecoration:'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}