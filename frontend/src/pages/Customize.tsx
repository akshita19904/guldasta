import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../utils/api';

interface SizeOption { label: string; priceModifier: number; }
interface AddOn { name: string; price: number; }

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isCustomizable: boolean;
  customizationOptions?: {
    colors?: string[];
    sizes?: SizeOption[];
    addOns?: AddOn[];
  };
}

export default function Customize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [customMessage, setCustomMessage] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
      if (res.data.product.customizationOptions?.colors?.length) {
        setSelectedColor(res.data.product.customizationOptions.colors[0]);
      }
      if (res.data.product.customizationOptions?.sizes?.length) {
        const medium = res.data.product.customizationOptions.sizes.find((s: SizeOption) => s.priceModifier === 0);
        setSelectedSize(medium || res.data.product.customizationOptions.sizes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddOn = (name: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const calculateTotal = () => {
    if (!product) return 0;
    let total = product.price;
    if (selectedSize) total += selectedSize.priceModifier;
    product.customizationOptions?.addOns?.forEach(addon => {
      if (selectedAddOns.has(addon.name)) total += addon.price;
    });
    return total;
  };

  const handleAddToCart = () => {
  const cartItem = {
    _id: product?._id + '-' + Date.now(),
    name: `${product?.name} (${selectedColor}${selectedSize ? `, ${selectedSize.label}` : ''})`,
    price: calculateTotal(),
    category: product?.category,
    quantity: 1,
    customMessage,
  };

  const existingCart = JSON.parse(sessionStorage.getItem('guldasta_reorder_cart') || '[]');
  existingCart.push(cartItem);
  sessionStorage.setItem('guldasta_reorder_cart', JSON.stringify(existingCart));

  setAdded(true);
  setTimeout(() => navigate('/store?reorder=true'), 1200);
};

  if (loading) {
    return <Layout><div style={{ textAlign: 'center', padding: 80, color: '#7A8A75' }}>Loading...</div></Layout>;
  }

  if (!product) {
    return <Layout><div style={{ textAlign: 'center', padding: 80, color: '#7A8A75' }}>Product not found</div></Layout>;
  }

  const options = product.customizationOptions;

  return (
    <Layout>
      <button onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#4A7C3F', fontSize: 13, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, maxWidth: 1000 }}>

        {/* Left — preview */}
        <div>
          <div style={{ width: '100%', height: 320, borderRadius: 20, background: 'linear-gradient(135deg, #EEF4EC, #FBF5E8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, marginBottom: 24 }}>
            {product.category === 'Bouquets' && '✿'}
            {product.category === 'Personalised' && '◈'}
            {product.category === 'Combos' && '◆'}
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#1C3A18', marginBottom: 8 }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 14, color: '#7A8A75', lineHeight: 1.7 }}>{product.description}</p>

          {/* Live preview summary */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, marginTop: 20, border: '1px solid #E8E2DA' }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 12 }}>
              Your customization
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedColor && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#7A8A75' }}>Style</span>
                  <span style={{ color: '#1C3A18', fontWeight: 500 }}>{selectedColor}</span>
                </div>
              )}
              {selectedSize && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#7A8A75' }}>Size</span>
                  <span style={{ color: '#1C3A18', fontWeight: 500 }}>{selectedSize.label}</span>
                </div>
              )}
              {selectedAddOns.size > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#7A8A75' }}>Add-ons</span>
                  <span style={{ color: '#1C3A18', fontWeight: 500 }}>{Array.from(selectedAddOns).join(', ')}</span>
                </div>
              )}
              {customMessage && (
                <div style={{ fontSize: 13, color: '#7A8A75', marginTop: 4, fontStyle: 'italic' }}>
                  "{customMessage}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — customization panel */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E8E2DA', position: 'sticky', top: 24, height: 'fit-content' }}>

          {options?.colors && options.colors.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 10 }}>
                Choose style
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {options.colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${selectedColor === color ? '#4A7C3F' : '#E8E2DA'}`, background: selectedColor === color ? '#EEF4EC' : 'white', cursor: 'pointer', fontSize: 13, color: '#1C3A18', fontFamily: "'DM Sans', sans-serif" }}>
                    {color}
                    {selectedColor === color && <Check size={15} color="#4A7C3F" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {options?.sizes && options.sizes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 10 }}>
                Size
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {options.sizes.map(size => (
                  <button key={size.label} onClick={() => setSelectedSize(size)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${selectedSize?.label === size.label ? '#4A7C3F' : '#E8E2DA'}`, background: selectedSize?.label === size.label ? '#EEF4EC' : 'white', cursor: 'pointer', fontSize: 13, color: '#1C3A18', fontFamily: "'DM Sans', sans-serif" }}>
                    <span>{size.label}</span>
                    <span style={{ color: size.priceModifier > 0 ? '#D4A96A' : size.priceModifier < 0 ? '#4A7C3F' : '#8A9E85', fontSize: 12 }}>
                      {size.priceModifier > 0 ? `+₹${size.priceModifier}` : size.priceModifier < 0 ? `-₹${Math.abs(size.priceModifier)}` : 'Included'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {options?.addOns && options.addOns.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 10 }}>
                Add-ons
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {options.addOns.map(addon => (
                  <button key={addon.name} onClick={() => toggleAddOn(addon.name)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${selectedAddOns.has(addon.name) ? '#4A7C3F' : '#E8E2DA'}`, background: selectedAddOns.has(addon.name) ? '#EEF4EC' : 'white', cursor: 'pointer', fontSize: 13, color: '#1C3A18', fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedAddOns.has(addon.name) ? <Check size={14} color="#4A7C3F" /> : <Plus size={14} color="#C5B8A8" />}
                      {addon.name}
                    </span>
                    <span style={{ color: '#4A7C3F', fontSize: 12 }}>
                      {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, color: '#4A5E45', marginBottom: 10 }}>
              Personal message (optional)
            </p>
            <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)}
              placeholder="Add a message card to include..."
              rows={3}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #D4DEAD', background: '#FDFCFA', color: '#1C3A18', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1.5px solid #E8E2DA', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#7A8A75' }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 600, color: '#2D5A27', fontFamily: "'Playfair Display', serif" }}>₹{calculateTotal()}</span>
          </div>

          <button onClick={handleAddToCart} disabled={added}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: added ? '#8A9E85' : 'linear-gradient(135deg, #2D5A27, #4A7C3F)', color: 'white', border: 'none', cursor: added ? 'default' : 'pointer', fontSize: 14, fontWeight: 500 }}>
            {added ? '✓ Added! Redirecting...' : 'Add to cart →'}
          </button>
        </div>
      </div>
    </Layout>
  );
}