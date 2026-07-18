import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { path: '/admin/overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { path: '/admin/orders', icon: <Package size={18} />, label: 'Orders' },
  { path: '/admin/products', icon: <ShoppingBag size={18} />, label: 'Products' },
  { path: '/admin/users', icon: <Users size={18} />, label: 'Users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F4F2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 220, height: '100vh', background: '#16181A', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: 'white', fontSize: 16, fontWeight: 500, margin: 0 }}>Guldasta</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '2px 0 0' }}>Admin console</p>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {adminNavItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  fontSize: 14
                }}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', width: '100%' }}>
            <ArrowLeft size={15} /> Back to app
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', width: '100%' }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: 28 }}>
        {children}
      </div>
    </div>
  );
}