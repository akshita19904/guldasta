import { useState, useEffect } from 'react';
import { Users, Receipt, IndianRupee, Sparkles } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import api from '../utils/api';

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  statusBreakdown: { status: string; count: number }[];
  bestSellers: { name: string; unitsSold: number }[];
  categoryBreakdown: { category: string; unitsSold: number }[];
  aiUsage: {
    totalCalls: number;
    successRate: number;
    byType: { type: string; total: number; successful: number }[];
  };
  ordersOverTime: { label: string; count: number; revenue: number }[];
}

const statusColors: Record<string, string> = {
  pending: '#B8860B',
  confirmed: '#2563A6',
  preparing: '#7C5CBF',
  out_for_delivery: '#2E7D4F',
  delivered: '#2E7D4F',
  cancelled: '#C0392B',
};

const aiTypeLabels: Record<string, string> = {
  gift_suggestion: 'Gift suggestions',
  message_single: 'Single messages',
  message_multi: 'Multi messages',
};

export default function AdminOverview() {
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/admin/all').then(res => setOrders(res.data.orders)).catch(console.error);
    api.get('/admin/analytics')
      .then(res => setAnalytics(res.data.analytics))
      .catch(console.error)
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const pending = orders.filter(o => o.status === 'pending');

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: 12,
    padding: 20,
    border: '1px solid #E5E5E5',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: '#1C1C1C',
    margin: '0 0 14px',
  };

  const maxOrdersInRange = analytics?.ordersOverTime.length
    ? Math.max(...analytics.ordersOverTime.map(o => o.count), 1)
    : 1;

  const totalStatusCount = analytics?.statusBreakdown.reduce((s, x) => s + x.count, 0) || 1;

  const maxBestSeller = analytics?.bestSellers.length
    ? Math.max(...analytics.bestSellers.map(b => b.unitsSold), 1)
    : 1;

  const maxCategory = analytics?.categoryBreakdown.length
    ? Math.max(...analytics.categoryBreakdown.map(c => c.unitsSold), 1)
    : 1;

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 24, fontWeight: 500, color: '#1C1C1C', marginBottom: 4 }}>Operations overview</h1>
      <p style={{ fontSize: 14, color: '#777', marginBottom: 24 }}>Today's snapshot</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <p style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} /> Total users
          </p>
          <p style={{ fontSize: 26, fontWeight: 600 }}>{analytics?.totalUsers ?? '—'}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Receipt size={14} /> Total orders
          </p>
          <p style={{ fontSize: 26, fontWeight: 600 }}>{analytics?.totalOrders ?? orders.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IndianRupee size={14} /> Total revenue
          </p>
          <p style={{ fontSize: 26, fontWeight: 600 }}>₹{analytics?.totalRevenue ?? 0}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> AI calls
          </p>
          <p style={{ fontSize: 26, fontWeight: 600 }}>{analytics?.aiUsage.totalCalls ?? 0}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Orders, last 6 months</p>
          {analyticsLoading ? (
            <p style={{ color: '#999', fontSize: 13 }}>Loading...</p>
          ) : !analytics?.ordersOverTime.length ? (
            <p style={{ color: '#999', fontSize: 13 }}>No order history yet</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
              {analytics.ordersOverTime.map(o => (
                <div key={o.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>{o.count}</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      borderRadius: 6,
                      background: '#378ADD',
                      height: `${Math.max((o.count / maxOrdersInRange) * 100, 4)}px`,
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#999' }}>{o.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Orders by status</p>
          {analyticsLoading ? (
            <p style={{ color: '#999', fontSize: 13 }}>Loading...</p>
          ) : !analytics?.statusBreakdown.length ? (
            <p style={{ color: '#999', fontSize: 13 }}>No orders yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.statusBreakdown.map(s => (
                <div key={s.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize', color: '#333' }}>{s.status.replace('_', ' ')}</span>
                    <span style={{ color: '#888' }}>{s.count}</span>
                  </div>
                  <div style={{ height: 6, background: '#F0F0EE', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(s.count / totalStatusCount) * 100}%`,
                        background: statusColors[s.status] || '#999',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Best-selling products</p>
          {analyticsLoading ? (
            <p style={{ color: '#999', fontSize: 13 }}>Loading...</p>
          ) : !analytics?.bestSellers.length ? (
            <p style={{ color: '#999', fontSize: 13 }}>No sales data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.bestSellers.map((b, i) => (
                <div key={b.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#333' }}>{i + 1}. {b.name}</span>
                    <span style={{ color: '#888' }}>{b.unitsSold} sold</span>
                  </div>
                  <div style={{ height: 6, background: '#F0F0EE', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(b.unitsSold / maxBestSeller) * 100}%`, background: '#2D5A27' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Popular categories</p>
          {analyticsLoading ? (
            <p style={{ color: '#999', fontSize: 13 }}>Loading...</p>
          ) : !analytics?.categoryBreakdown.length ? (
            <p style={{ color: '#999', fontSize: 13 }}>No category data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.categoryBreakdown.map(c => (
                <div key={c.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#333' }}>{c.category}</span>
                    <span style={{ color: '#888' }}>{c.unitsSold}</span>
                  </div>
                  <div style={{ height: 6, background: '#F0F0EE', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c.unitsSold / maxCategory) * 100}%`, background: '#D4B978' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 28 }}>
        <p style={sectionTitleStyle}>AI usage by type</p>
        {analyticsLoading ? (
          <p style={{ color: '#999', fontSize: 13 }}>Loading...</p>
        ) : !analytics?.aiUsage.byType.length ? (
          <p style={{ color: '#999', fontSize: 13 }}>No AI usage logged yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {analytics.aiUsage.byType.map(a => (
              <div key={a.type} style={{ background: '#FAFAF9', borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{aiTypeLabels[a.type] || a.type}</p>
                <p style={{ fontSize: 20, fontWeight: 600, color: '#1C1C1C' }}>{a.total}</p>
                <p style={{ fontSize: 12, color: '#2E7D4F', marginTop: 2 }}>
                  {a.total > 0 ? Math.round((a.successful / a.total) * 100) : 0}% success
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Needs attention</h2>
      {pending.length === 0 ? (
        <p style={{ fontSize: 13, color: '#999' }}>Nothing pending right now</p>
      ) : (
        pending.map(o => (
          <div key={o._id} style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Order #{o._id.slice(-8).toUpperCase()} — {o.recipientName}</span>
            <span style={{ color: '#B8860B' }}>Pending</span>
          </div>
        ))
      )}
    </AdminLayout>
  );
}