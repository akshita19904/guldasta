import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F2E8D9 50%, #EDD9B0 100%)' }}>

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #B5C9A8 0%, #C4B5C9 50%, #E8A0A8 100%)' }}>

        <div className="absolute top-8 right-8 w-40 h-40 rounded-full opacity-20" style={{ background: '#FAF6F0' }}></div>
        <div className="absolute bottom-20 left-8 w-32 h-32 rounded-full opacity-15" style={{ background: '#D4A96A' }}></div>

        <div className="relative z-10 text-center">
          <div className="text-8xl mb-6">🌿</div>
          <h2 className="text-4xl font-serif text-white mb-4">
            Your circle of<br />
            <span className="italic">loved ones</span>
          </h2>
          <p className="text-lg font-light max-w-xs mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.85)' }}>
            Keep track of the people who matter most and never forget what makes them feel special
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-xs mx-auto">
            {[
              { emoji: '🎂', label: 'Birthdays' },
              { emoji: '💍', label: 'Anniversaries' },
              { emoji: '🎓', label: 'Milestones' },
              { emoji: '🎁', label: 'Gift ideas' },
              { emoji: '💌', label: 'Messages' },
              { emoji: '✨', label: 'Celebrations' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="text-xl mb-1">{item.emoji}</div>
                <div className="text-xs text-white" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <h1 className="text-5xl font-serif mb-2" style={{ color: '#3D2B1F' }}>
              Gul<span className="italic" style={{ color: '#E8A0A8' }}>dasta</span>
            </h1>
            <p className="text-xs tracking-widest uppercase font-light" style={{ color: '#9B7B6B' }}>
              Relationship Assistant
            </p>
            <div className="flex justify-center gap-1 mt-3">
              {['#E8A0A8', '#B5C9A8', '#C4B5C9', '#D4A96A'].map((c, i) => (
                <div key={i} className="w-6 h-1 rounded-full" style={{ background: c }}></div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-8 shadow-lg"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(232,160,168,0.2)' }}>

            <h2 className="text-2xl font-serif mb-1" style={{ color: '#3D2B1F' }}>Create account</h2>
            <p className="text-sm mb-6 font-light" style={{ color: '#9B7B6B' }}>
              Start celebrating the people you love 🌸
            </p>

            {error && (
              <div className="text-sm px-4 py-3 rounded-2xl mb-4"
                style={{ background: '#FFF0F1', border: '1px solid #F5D0D4', color: '#C97C85' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full name', type: 'text', value: name, setter: setName, placeholder: 'Your name' },
                { label: 'Email', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
                { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: 'Min. 6 characters' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: '#6B4C3B' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    required
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: '#FAF6F0', border: '1.5px solid #E8D5BE', color: '#3D2B1F' }}
                    onFocus={e => e.target.style.borderColor = '#B5C9A8'}
                    onBlur={e => e.target.style.borderColor = '#E8D5BE'}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all mt-2"
                style={{ background: 'linear-gradient(135deg, #B5C9A8, #8BA87B)', color: 'white', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Creating account...' : 'Create account 🌿'}
              </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: '#9B7B6B' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium" style={{ color: '#E8A0A8' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}