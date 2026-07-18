import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, Phone, X, Clock, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
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
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pending confirmation', color: '#D4A96A', bg: '#FBF5E8', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#5B9EC9', bg: '#F0F7FB', icon: CheckCircle },
  preparing: { label: 'Preparing', color: '#9B7DC8', bg: '#F5F0FB', icon: Package },
  out_for_delivery: { label: 'Out for delivery', color: '#4A7C3F', bg: '#EEF4EC', icon: Truck },
  delivered: { label: 'Delivered', color: '#4A7C3F', bg: '#EEF4EC', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#C0392B', bg: '#FDF0EE', icon: XCircle },
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = (order: Order) => {
    const reorderItems = order.items.map((item, i) => ({
      _id: `reorder-${order._id}-${i}`,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: 'Reorder'
    }));
    sessionStorage.setItem('guldasta_reorder_cart', JSON.stringify(reorderItems));
    navigate('/store?reorder=true');
  };

  const filtered = orders.filter(o => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(o.status);
    return true;
  });

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
          My Orders
        </h1>
        <p style={{ fontSize: 14, color: '#7A8A75' }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content', border: '1px solid #E8E2DA' }}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: filter === f ? 500 : 400, background: filter === f ? '#EEF4EC' : 'transparent', color: filter === f ? '#2D5A27' : '#7A8A75', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7A8A75' }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={28} color="#4A7C3F" />
          </div>
          <p style={{ fontSize: 16, color: '#1C3A18', fontWeight: 500, marginBottom: 6 }}>No orders yet</p>
          <p style={{ fontSize: 13, color: '#7A8A75' }}>Visit the Gift Store to place your first order</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const canCancel = ['pending', 'confirmed'].includes(order.status);

            return (
              <div key={order._id} style={{ background: 'white', borderRadius: 18, padding: 24, border: '1px solid #E8E2DA' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#8A9E85', marginBottom: 4 }}>
                      Order #{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: config.bg }}>
                        <StatusIcon size={13} color={config.color} />
                        <span style={{ fontSize: 12, color: config.color, fontWeight: 500 }}>{config.label}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#2D5A27', fontFamily: "'Playfair Display', serif" }}>
                    ₹{order.totalAmount}
                  </span>
                </div>

                <div style={{ background: '#F7F4EF', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                      <span style={{ color: '#1C3A18' }}>{item.name} x{item.quantity}</span>
                      <span style={{ color: '#4A7C3F' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 12, color: '#7A8A75' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <MapPin size={14} color="#8A9E85" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span>{order.recipientName} · {order.deliveryAddress}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#8A9E85" />
                    <span>{order.recipientPhone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="#8A9E85" />
                    <span>{new Date(order.deliveryDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {order.giftMessage && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#FBF5E8', borderRadius: 10, fontSize: 12, color: '#6B5030', fontStyle: 'italic' }}>
                    "{order.giftMessage}"
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  {canCancel && (
                    <button onClick={() => handleCancel(order._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'white', border: '1.5px solid #F0C5BE', color: '#C0392B', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                      <X size={13} /> Cancel order
                    </button>
                  )}
                  <button onClick={() => handleReorder(order)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#EEF4EC', border: 'none', color: '#2D5A27', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                    <RefreshCw size={13} /> Reorder this
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}