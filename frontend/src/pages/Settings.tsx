import { useState, useEffect } from 'react';
import { User, Lock, Bell, Check, AlertCircle, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AVATAR_COLORS = [
  '#2D5A27', '#4A7C3F', '#D4A96A', '#C07D4A',
  '#5B9EC9', '#7C5CBF', '#C07070', '#4A8A8A',
];

type Section = 'profile' | 'password' | 'notifications';

export default function Settings() {
  const { user, setUser } = useAuth() as any;

  const [activeSection, setActiveSection] = useState<Section>('profile');

  // Profile state
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState('#2D5A27');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMsg, setNotifMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarColor(user.avatar || '#2D5A27');
      setNotificationsEnabled(user.notificationsEnabled !== false);
    }
  }, [user]);

  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await api.put('/auth/profile', { name, avatar: avatarColor });
      if (setUser) setUser({ ...user, name, avatar: avatarColor });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotifToggle = async (val: boolean) => {
    setNotificationsEnabled(val);
    setNotifLoading(true);
    setNotifMsg(null);
    try {
      await api.put('/auth/profile', { notificationsEnabled: val });
      if (setUser) setUser({ ...user, notificationsEnabled: val });
      setNotifMsg({ type: 'success', text: val ? 'Reminder emails turned on' : 'Reminder emails turned off' });
    } catch (err: any) {
      setNotificationsEnabled(!val); // revert
      setNotifMsg({ type: 'error', text: 'Failed to update notification preference' });
    } finally {
      setNotifLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1.5px solid #D4DEAD',
    background: '#FDFCFA',
    color: '#1C3A18',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: "'DM Sans', sans-serif",
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: 11,
    fontWeight: 500 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#4A5E45',
    marginBottom: 7,
  };

  const navItems: { key: Section; label: string; icon: any }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Change password', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <Layout>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
        Settings
      </h1>
      <p style={{ fontSize: 14, color: '#7A8A75', marginBottom: 28 }}>Manage your account and preferences</p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Sidebar nav */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8E2DA', overflow: 'hidden' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeSection === item.key;
            return (
              <button key={item.key} onClick={() => setActiveSection(item.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: active ? '#EEF4EC' : 'white',
                  border: 'none', borderBottom: '1px solid #F0EBE3', cursor: 'pointer',
                  color: active ? '#2D5A27' : '#4A5E45', textAlign: 'left' as const,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} />
                  <span style={{ fontSize: 14, fontWeight: active ? 500 : 400 }}>{item.label}</span>
                </div>
                {active && <ChevronRight size={14} color="#2D5A27" />}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8E2DA', padding: 28 }}>

          {/* ── Profile section ── */}
          {activeSection === 'profile' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1C3A18', marginBottom: 4 }}>Profile information</h2>
              <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 24 }}>Update your name and avatar colour</p>

              {/* Avatar preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: avatarColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 22, fontWeight: 600,
                  fontFamily: "'Playfair Display', serif",
                }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1C3A18', marginBottom: 8 }}>Avatar colour</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {AVATAR_COLORS.map(color => (
                      <button key={color} onClick={() => setAvatarColor(color)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: color,
                          border: avatarColor === color ? '3px solid #1C3A18' : '2px solid transparent',
                          cursor: 'pointer', outline: 'none', padding: 0,
                        }} />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input value={user?.email || ''} disabled
                    style={{ ...inputStyle, background: '#F7F4EF', color: '#999', cursor: 'not-allowed' }} />
                  <p style={{ fontSize: 11, color: '#999', marginTop: 5 }}>Email cannot be changed</p>
                </div>
              </div>

              {profileMsg && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                  background: profileMsg.type === 'success' ? '#EEF4EC' : '#FDF0EE',
                  color: profileMsg.type === 'success' ? '#2D5A27' : '#A04030',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {profileMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  {profileMsg.text}
                </div>
              )}

              <button onClick={handleProfileSave} disabled={profileLoading}
                style={{
                  marginTop: 20, padding: '11px 24px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)',
                  color: 'white', border: 'none', cursor: profileLoading ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 500, opacity: profileLoading ? 0.7 : 1,
                }}>
                {profileLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}

          {/* ── Password section ── */}
          {activeSection === 'password' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1C3A18', marginBottom: 4 }}>Change password</h2>
              <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 24 }}>Choose a strong password of at least 6 characters</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <div>
                  <label style={labelStyle}>Current password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>New password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm new password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" style={inputStyle} />
                </div>
              </div>

              {passwordMsg && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                  background: passwordMsg.type === 'success' ? '#EEF4EC' : '#FDF0EE',
                  color: passwordMsg.type === 'success' ? '#2D5A27' : '#A04030',
                  display: 'flex', alignItems: 'center', gap: 8, maxWidth: 400,
                }}>
                  {passwordMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  {passwordMsg.text}
                </div>
              )}

              <button onClick={handlePasswordChange} disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                style={{
                  marginTop: 20, padding: '11px 24px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)',
                  color: 'white', border: 'none',
                  cursor: (passwordLoading || !currentPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 500,
                  opacity: (passwordLoading || !currentPassword || !newPassword || !confirmPassword) ? 0.6 : 1,
                }}>
                {passwordLoading ? 'Changing...' : 'Change password'}
              </button>
            </div>
          )}

          {/* ── Notifications section ── */}
          {activeSection === 'notifications' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1C3A18', marginBottom: 4 }}>Notification preferences</h2>
              <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 28 }}>Control how Guldasta reminds you about important dates</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Main toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 14, border: '1.5px solid #E8E2DA', background: '#FDFCFA',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1C3A18', marginBottom: 3 }}>Reminder emails</p>
                    <p style={{ fontSize: 12, color: '#7A8A75' }}>
                      Get emailed before birthdays, anniversaries, and custom reminders
                    </p>
                  </div>
                  <button onClick={() => handleNotifToggle(!notificationsEnabled)} disabled={notifLoading}
                    style={{
                      width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                      background: notificationsEnabled ? '#2D5A27' : '#D0CCC7',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}>
                    <div style={{
                      position: 'absolute', top: 3,
                      left: notificationsEnabled ? 25 : 3,
                      width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>

                {/* Info cards */}
                <div style={{ background: '#F7F4EF', borderRadius: 12, padding: '14px 18px' }}>
                  <p style={{ fontSize: 13, color: '#4A5E45', fontWeight: 500, marginBottom: 10 }}>When notifications are on, you receive:</p>
                  {[
                    'An advance email based on each reminder\'s "days before" setting',
                    'A same-day email on the actual date',
                    'A catch-up email if the app was briefly unavailable and missed the date',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                      <Check size={13} color="#2D5A27" style={{ marginTop: 2, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, color: '#4A5E45', lineHeight: 1.5 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {notifMsg && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                  background: notifMsg.type === 'success' ? '#EEF4EC' : '#FDF0EE',
                  color: notifMsg.type === 'success' ? '#2D5A27' : '#A04030',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {notifMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  {notifMsg.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}