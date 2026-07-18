import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Bell, Calendar,
  Gift, MessageCircle, Settings, LogOut,
  Leaf, Menu, X, ShoppingBag
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { path: '/people', icon: <Users size={18} />, label: 'My Circle' },
  { path: '/celebrations', icon: <Bell size={18} />, label: 'Celebrations' },
  { path: '/gifts', icon: <Gift size={18} />, label: 'Gift Ideas' },
  { path: '/messages', icon: <MessageCircle size={18} />, label: 'Messages' },
  { path: '/store', icon: <ShoppingBag size={18} />, label: 'Gift Store' },
  { path: '/orders', icon: <Package size={18} />, label: 'My Orders' },
  { path: '/settings', icon: <Settings size={18} />, label: 'Settings' },
];


export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const SidebarContent = () => (
    <div style={{
      width: 240,
      height: '100vh',
      background: '#1C3A18',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={17} color="white" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'white' }}>
            Gul<em style={{ color: '#D4B978' }}>dasta</em>
          </span>
        </div>
        <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 5 }}>
          Relationship Assistant
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '0 10px', marginBottom: 8 }}>
          Main
        </p>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                background: active ? 'rgba(107,158,94,0.35)' : 'transparent',
                textDecoration: 'none', fontSize: 14, fontWeight: active ? 500 : 400,
                borderLeft: active ? '3px solid #6B9E5E' : '3px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4A7C3F, #D4B978)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13, color: 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.45)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', width: '100%', fontFamily: "'DM Sans', sans-serif" }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F4EF', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Desktop sidebar — only show on large screens */}
      {isDesktop && <SidebarContent />}

      {/* Mobile header — only show on small screens */}
      {!isDesktop && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: '#1C3A18', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 50
        }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'white' }}>
            Gul<em style={{ color: '#D4B978' }}>dasta</em>
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {!isDesktop && mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Spacer for mobile header */}
        {!isDesktop && <div style={{ height: 56 }}></div>}
        <main style={{ flex: 1, padding: '28px 28px', maxWidth: 1200, width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}