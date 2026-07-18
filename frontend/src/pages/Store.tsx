import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Plus, Minus, X, ChevronRight, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  isCustomizable: boolean;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const categories = ['All', 'Bouquets', 'Hampers', 'Cakes', 'Experiences', 'Personalised', 'Plants', 'Combos'];

const categoryColors: Record<string, { bg: string; color: string }> = {
  Bouquets: { bg: '#FDF0EE', color: '#E07B6A' },
  Hampers: { bg: '#FBF5E8', color: '#D4A96A' },
  Cakes: { bg: '#F5F0FB', color: '#9B7DC8' },
  Experiences: { bg: '#EEF4EC', color: '#4A7C3F' },
  Personalised: { bg: '#F0F7FB', color: '#5B9EC9' },
  Plants: { bg: '#EEF4EC', color: '#4A7C3F' },
  Combos: { bg: '#FDF0EE', color: '#E07B6A' },
  Reorder: { bg: '#FBF5E8', color: '#D4A96A' },
};

const categoryEmoji: Record<string, string> = {
  Bouquets: '✿',
  Hampers: '◫',
  Cakes: '◍',
  Experiences: '✦',
  Personalised: '◈',
  Plants: '❀',
  Combos: '◆',
};

export default function Store() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('guldasta_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);
  const [orderError, setOrderError] = useState('');
  const [checkout, setCheckout] = useState({
    recipientName: '', recipientPhone: '', deliveryAddress: '', deliveryDate: '', giftMessage: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [category]);

  useEffect(() => {
    localStorage.setItem('guldasta_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (searchParams.get('reorder') === 'true') {
      const reorderData = sessionStorage.getItem('guldasta_reorder_cart');
      if (reorderData) {
        const items = JSON.parse(reorderData);
        setCart(prev => {
          const merged = [...prev];
          items.forEach((newItem: CartItem) => {
            const existing = merged.find(i => i._id === newItem._id);
            if (existing) {
              existing.quantity += newItem.quantity;
            } else {
              merged.push(newItem);
            }
          });
          return merged;
        });
        setShowCart(true);
        sessionStorage.removeItem('guldasta_reorder_cart');
      }
    }

    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      setHighlightedProduct(highlightId);
      setTimeout(() => {
        const el = document.getElementById(`product-${highlightId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
      setTimeout(() => setHighlightedProduct(null), 3000);
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = category !== 'All' ? `?category=${category}` : '';
      const res = await api.get(`/products${params}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seedIfEmpty = async () => {
    try {
      await api.get('/products/seed');
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item._id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      });
      return updated.filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item._id !== id));

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    try {
      await api.post('/orders', {
        items: cart.map(item => ({ productId: item._id, name: item.name, price: item.price, quantity: item.quantity })),
        ...checkout
      });
      setOrderSuccess(true);
      setCart([]);
      setShowCheckout(false);
      setTimeout(() => setOrderSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#1C3A18', marginBottom: 4 }}>
            Gift Store
          </h1>
          <p style={{ fontSize: 14, color: '#7A8A75' }}>Curated gifts, ready to send</p>
        </div>
        <button onClick={() => setShowCart(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, position: 'relative' }}>
          <ShoppingBag size={17} /> Cart
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#D4A96A', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Order success banner */}
      {orderSuccess && (
        <div style={{ background: 'linear-gradient(135deg, #EEF4EC, #F0F7EE)', border: '1px solid #B5CEB0', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={20} color="#2D5A27" />
          <p style={{ fontSize: 14, color: '#2D5A27', fontWeight: 500, margin: 0 }}>
            Order placed! We'll confirm via WhatsApp shortly. Check "My Orders" to track it.
          </p>
        </div>
      )}

      {/* Search + Categories */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8A9E85' }}>
            <Search size={16} />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gifts..."
            style={{ width: '100%', padding: '11px 16px 11px 42px', borderRadius: 12, border: '1.5px solid #D4DEAD', background: 'white', color: '#1C3A18', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${category === cat ? '#4A7C3F' : '#E8E2DA'}`, background: category === cat ? '#EEF4EC' : 'white', color: category === cat ? '#2D5A27' : '#7A8A75', fontSize: 13, cursor: 'pointer', fontWeight: category === cat ? 500 : 400, fontFamily: "'DM Sans', sans-serif" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#7A8A75' }}>Loading store...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EEF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShoppingBag size={28} color="#4A7C3F" />
          </div>
          <p style={{ fontSize: 16, color: '#1C3A18', fontWeight: 500, marginBottom: 16 }}>Store is empty</p>
          <button onClick={seedIfEmpty}
            style={{ padding: '10px 24px', borderRadius: 10, background: '#EEF4EC', color: '#2D5A27', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Load sample products
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map(product => {
            const colors = categoryColors[product.category] || categoryColors.Bouquets;
            const cartItem = cart.find(item => item._id === product._id);
            return (
              <div
                key={product._id}
                id={`product-${product._id}`}
                style={{
                  background: 'white', borderRadius: 16, padding: 20,
                  border: highlightedProduct === product._id ? '2px solid #4A7C3F' : '1px solid #E8E2DA',
                  boxShadow: highlightedProduct === product._id ? '0 0 0 4px rgba(74,124,63,0.15)' : 'none',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(45,90,39,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = highlightedProduct === product._id ? '0 0 0 4px rgba(74,124,63,0.15)' : 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>

                {/* ── Product image ── */}
                <div style={{ width: '100%', height: 160, borderRadius: 12, background: colors.bg, marginBottom: 14, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.setAttribute('data-fallback', 'true');
                      }}
                    />
                  ) : (
                    <span>{categoryEmoji[product.category] || '✿'}</span>
                  )}
                </div>

                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: colors.bg, color: colors.color, fontWeight: 500 }}>
                  {product.category}
                </span>

                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1C3A18', margin: '10px 0 6px' }}>{product.name}</h3>
                <p style={{ fontSize: 12, color: '#7A8A75', lineHeight: 1.5, marginBottom: 14, minHeight: 36 }}>
                  {product.description.slice(0, 70)}...
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: product.isCustomizable && !cartItem ? 10 : 0 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color: '#2D5A27', fontFamily: "'Playfair Display', serif" }}>
                    ₹{product.price}
                  </span>
                  {cartItem ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EEF4EC', borderRadius: 10, padding: '4px 8px' }}>
                      <button onClick={() => updateQuantity(product._id, -1)}
                        style={{ width: 24, height: 24, borderRadius: 7, background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D5A27' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#2D5A27', minWidth: 14, textAlign: 'center' }}>{cartItem.quantity}</span>
                      <button onClick={() => updateQuantity(product._id, 1)}
                        style={{ width: 24, height: 24, borderRadius: 7, background: '#2D5A27', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : !product.isCustomizable ? (
                    <button onClick={() => addToCart(product)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, background: '#2D5A27', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                      <Plus size={13} /> Add
                    </button>
                  ) : null}
                </div>

                {product.isCustomizable && !cartItem && (
                  <button onClick={() => navigate(`/customize/${product._id}`)}
                    style={{ width: '100%', padding: '8px', borderRadius: 9, background: '#FBF5E8', color: '#D4A96A', border: '1.5px solid #F0E0BE', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    ✨ Customize & Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,58,24,0.4)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
          onClick={() => setShowCart(false)}>
          <div style={{ background: 'white', width: 400, maxWidth: '90vw', height: '100vh', overflowY: 'auto', padding: 24 }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18' }}>Your cart</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A8A75' }}>
                <X size={22} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#7A8A75' }}>
                <ShoppingBag size={40} color="#C8D9C4" style={{ marginBottom: 12 }} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: 12, paddingBottom: 14, borderBottom: '1px solid #F0EBE3' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#1C3A18', marginBottom: 4 }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: '#4A7C3F' }}>₹{item.price} each</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQuantity(item._id, -1)}
                          style={{ width: 26, height: 26, borderRadius: 7, background: '#F7F4EF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: 13, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)}
                          style={{ width: 26, height: 26, borderRadius: 7, background: '#F7F4EF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C5B8A8' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingTop: 14, borderTop: '1.5px solid #E8E2DA' }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1C3A18' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#2D5A27', fontFamily: "'Playfair Display', serif" }}>₹{cartTotal}</span>
                </div>

                <button onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  style={{ width: '100%', padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Proceed to checkout <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,58,24,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowCheckout(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1C3A18', marginBottom: 6 }}>Delivery details</h2>
            <p style={{ fontSize: 13, color: '#7A8A75', marginBottom: 24 }}>Total: ₹{cartTotal} · {cartCount} items</p>

            <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handlePlaceOrder(e); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Recipient name *', key: 'recipientName', type: 'text', placeholder: 'Who is this for?' },
                { label: 'Recipient phone *', key: 'recipientPhone', type: 'tel', placeholder: '+91 98765 43210' },
                { label: 'Delivery address *', key: 'deliveryAddress', type: 'text', placeholder: 'Full address' },
                { label: 'Delivery date *', key: 'deliveryDate', type: 'date', placeholder: '' },
                { label: 'Gift message (optional)', key: 'giftMessage', type: 'text', placeholder: 'A message to include with the gift' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 7 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(checkout as any)[field.key]}
                    onChange={e => setCheckout({ ...checkout, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.label.includes('*')}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              {orderError && (
                <div style={{ background: '#FDF0EE', border: '1px solid #F0C5BE', color: '#A04030', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>
                  {orderError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCheckout(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: '#F7F4EF', color: '#7A8A75', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Place order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}