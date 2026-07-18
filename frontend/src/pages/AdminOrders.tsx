import { useState, useEffect } from 'react';
import { Package, MapPin, Calendar, Phone, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import api from '../utils/api';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  status: string;
  giftMessage?: string;
  createdAt: string;
  userId?: { name: string; email: string };
}

const statusFlow = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pending', color: '#B8860B', bg: '#FBF1DD', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#2563A6', bg: '#E8F1FA', icon: CheckCircle },
  preparing: { label: 'Preparing', color: '#7C5CBF', bg: '#F1ECFA', icon: Package },
  out_for_delivery: { label: 'Out for delivery', color: '#2E7D4F', bg: '#E8F5EC', icon: Truck },
  delivered: { label: 'Delivered', color: '#2E7D4F', bg: '#E8F5EC', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#C0392B', bg: '#FDEDEB', icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getNextStatus = (current: string) => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 24, fontWeight: 500, color: '#1C1C1C', marginBottom: 4 }}>All orders</h1>
      <p style={{ fontSize: 14, color: '#777', marginBottom: 24 }}>{orders.length} total across all users</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', ...statusFlow, 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${filter === s ? '#1C1C1C' : '#E0E0E0'}`, background: filter === s ? '#1C1C1C' : 'white', color: filter === s ? 'white' : '#666', fontSize: 12, cursor: 'pointer', fontWeight: filter === s ? 500 : 400, textTransform: 'capitalize' }}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>No orders in this category</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(order => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const nextStatus = getNextStatus(order.status);

            return (
              <div key={order._id} style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #E5E5E5' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                      Order #{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
                      {order.userId && ` · by ${order.userId.name} (${order.userId.email})`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: config.bg, width: 'fit-content' }}>
                      <StatusIcon size={13} color={config.color} />
                      <span style={{ fontSize: 12, color: config.color, fontWeight: 500 }}>{config.label}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#1C1C1C' }}>₹{order.totalAmount}</span>
                </div>

                <div style={{ background: '#FAFAF9', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                      <span>{item.name} x{item.quantity}</span>
                      <span style={{ color: '#666' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 12, color: '#777', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <MapPin size={14} color="#999" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span>{order.recipientName} · {order.deliveryAddress}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#999" />
                    <span>{order.recipientPhone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="#999" />
                    <span>{new Date(order.deliveryDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {order.giftMessage && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FBF1DD', borderRadius: 10, fontSize: 12, color: '#6B5030', fontStyle: 'italic' }}>
                    "{order.giftMessage}"
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  {nextStatus && (
                    <button onClick={() => updateStatus(order._id, nextStatus)}
                      style={{ padding: '8px 16px', borderRadius: 10, background: '#1C1C1C', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
                      Mark as {nextStatus.replace('_', ' ')}
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button onClick={() => updateStatus(order._id, 'cancelled')}
                      style={{ padding: '8px 16px', borderRadius: 10, background: 'white', border: '1.5px solid #F0C5BE', color: '#C0392B', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                      Reject / Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}