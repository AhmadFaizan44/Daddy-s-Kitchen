import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, UtensilsCrossed, Calendar, User, Clock, CheckCircle, Mic, X, ChevronRight, Star, MapPin, Phone, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { MENU_ITEMS, CATEGORIES } from './constants';
import { MenuItem, CartItem, Booking, Order, ViewState } from './types';
import { GeminiLiveService } from './services/geminiLiveService';

// --- Context & State ---

interface AppState {
  view: ViewState;
  cart: CartItem[];
  orders: Order[];
  currentOrder: Order | null; // The one just placed
  bookings: Booking[];
  isVoiceAgentOpen: boolean;
}

const App = () => {
  const [state, setState] = useState<AppState>({
    view: ViewState.HOME,
    cart: [],
    orders: [],
    currentOrder: null,
    bookings: [],
    isVoiceAgentOpen: false,
  });

  const cartTotal = useMemo(() => {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.cart]);

  const addToCart = (item: MenuItem) => {
    setState(prev => {
      const existing = prev.cart.find(i => i.id === item.id);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        };
      }
      return { ...prev, cart: [...prev.cart, { ...item, quantity: 1 }] };
    });
  };

  const removeFromCart = (itemId: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(i => i.id !== itemId)
    }));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(i => {
        if (i.id === itemId) {
          const newQty = Math.max(0, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      }).filter(i => i.quantity > 0)
    }));
  };

  const placeOrder = (details: { name: string; phone: string; address: string }) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [...state.cart],
      total: cartTotal,
      status: 'pending',
      customerName: details.name,
      customerPhone: details.phone,
      address: details.address,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      orders: [...prev.orders, newOrder],
      cart: [],
      currentOrder: newOrder,
      view: ViewState.TRACKING,
      isVoiceAgentOpen: true // Auto-trigger voice agent
    }));
  };

  const navigate = (view: ViewState) => setState(prev => ({ ...prev, view }));

  // --- Components ---

  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(ViewState.HOME)}>
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
              <span className="text-stone-900 font-serif font-bold text-xl">D</span>
            </div>
            <span className="text-2xl font-serif text-gold-400 tracking-wide">Daddy's Kitchen</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate(ViewState.HOME)} className={`text-sm tracking-widest uppercase hover:text-gold-400 transition ${state.view === ViewState.HOME ? 'text-gold-400' : 'text-stone-300'}`}>Home</button>
            <button onClick={() => navigate(ViewState.MENU)} className={`text-sm tracking-widest uppercase hover:text-gold-400 transition ${state.view === ViewState.MENU ? 'text-gold-400' : 'text-stone-300'}`}>Menu</button>
            <button onClick={() => navigate(ViewState.BOOKING)} className={`text-sm tracking-widest uppercase hover:text-gold-400 transition ${state.view === ViewState.BOOKING ? 'text-gold-400' : 'text-stone-300'}`}>Book Table</button>
            {state.orders.length > 0 && (
               <button onClick={() => navigate(ViewState.TRACKING)} className={`text-sm tracking-widest uppercase hover:text-gold-400 transition ${state.view === ViewState.TRACKING ? 'text-gold-400' : 'text-stone-300'}`}>Orders</button>
            )}
            <button onClick={() => navigate(ViewState.ADMIN)} className={`text-sm tracking-widest uppercase hover:text-gold-400 transition ${state.view === ViewState.ADMIN ? 'text-gold-400' : 'text-stone-300'}`}>Admin</button>
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={() => navigate(ViewState.CART)}
              className="relative p-2 text-gold-400 hover:bg-stone-800 rounded-full transition"
            >
              <ShoppingBag size={24} />
              {state.cart.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs flex items-center justify-center rounded-full font-bold">
                  {state.cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const Hero = () => (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/restaurant/1920/1080?grayscale" 
          alt="Fine Dining" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
        <h2 className="text-gold-400 tracking-[0.3em] uppercase text-sm md:text-base animate-[fadeIn_1s_ease-out]">Experience Luxury</h2>
        <h1 className="text-5xl md:text-8xl font-serif text-stone-100 leading-tight">
          Taste the <span className="text-gold-500 italic">Extraordinary</span>
        </h1>
        <p className="text-stone-300 text-lg md:text-xl font-light max-w-2xl mx-auto">
          Immerse yourself in a culinary journey crafted by master chefs. Premium ingredients, exquisite flavors, and an unforgettable atmosphere.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={() => navigate(ViewState.MENU)}
            className="px-8 py-4 bg-gold-500 text-stone-900 font-bold uppercase tracking-wider hover:bg-gold-400 transition transform hover:scale-105"
          >
            Order Online
          </button>
          <button 
            onClick={() => navigate(ViewState.BOOKING)}
            className="px-8 py-4 border border-gold-500 text-gold-500 font-bold uppercase tracking-wider hover:bg-gold-500/10 transition transform hover:scale-105"
          >
            Book a Table
          </button>
        </div>
      </div>
    </div>
  );

  const Menu = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    
    const filteredItems = activeCategory === 'All' 
      ? MENU_ITEMS 
      : MENU_ITEMS.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

    return (
      <div className="min-h-screen pt-28 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-gold-400 mb-4">Our Menu</h2>
          <div className="w-24 h-1 bg-gold-600 mx-auto"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full border transition ${
                activeCategory === cat 
                  ? 'bg-gold-500 border-gold-500 text-stone-900 font-bold' 
                  : 'border-stone-700 text-stone-400 hover:border-gold-500 hover:text-gold-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="group bg-stone-800/50 border border-stone-800 rounded-xl overflow-hidden hover:border-gold-500/50 transition duration-300">
              <div className="relative h-64 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                {item.popular && (
                  <div className="absolute top-4 right-4 bg-gold-500 text-stone-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Popular
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-stone-100">{item.name}</h3>
                  <span className="text-gold-400 font-bold text-lg">${item.price}</span>
                </div>
                <p className="text-stone-400 text-sm mb-6 line-clamp-2">{item.description}</p>
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full py-3 bg-stone-700 hover:bg-gold-500 hover:text-stone-900 text-stone-200 transition font-bold uppercase text-sm tracking-wide rounded-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BookingView = () => (
    <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-stone-800/50 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-stone-700">
        <h2 className="text-3xl md:text-4xl font-serif text-gold-400 mb-8 text-center">Reserve Your Table</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); alert('Table booked! (Simulation)'); navigate(ViewState.HOME); }}>
          <div className="space-y-2">
            <label className="text-stone-400 text-sm uppercase tracking-wide">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 text-stone-500" size={18} />
              <input type="date" className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 pl-12 pr-4 text-stone-200 focus:border-gold-500 focus:outline-none transition" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-stone-400 text-sm uppercase tracking-wide">Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-3.5 text-stone-500" size={18} />
              <input type="time" className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 pl-12 pr-4 text-stone-200 focus:border-gold-500 focus:outline-none transition" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-stone-400 text-sm uppercase tracking-wide">Guests</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-stone-500" size={18} />
              <select className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 pl-12 pr-4 text-stone-200 focus:border-gold-500 focus:outline-none transition">
                {[2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} Guests</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-stone-400 text-sm uppercase tracking-wide">Seating Preference</label>
            <div className="relative">
              <UtensilsCrossed className="absolute left-4 top-3.5 text-stone-500" size={18} />
              <select className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 pl-12 pr-4 text-stone-200 focus:border-gold-500 focus:outline-none transition">
                <option value="indoor">Indoor Dining Room</option>
                <option value="outdoor">Garden Terrace</option>
                <option value="bar">Bar Seating</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-stone-400 text-sm uppercase tracking-wide">Special Requests</label>
            <textarea className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 px-4 text-stone-200 focus:border-gold-500 focus:outline-none transition h-32 resize-none" placeholder="Allergies, special occasions, etc."></textarea>
          </div>
          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full py-4 bg-gold-500 text-stone-900 font-bold uppercase tracking-wider rounded-lg hover:bg-gold-400 transition transform hover:scale-[1.01]">Confirm Reservation</button>
          </div>
        </form>
      </div>
    </div>
  );

  const Cart = () => (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-serif text-gold-400 mb-8">Your Cart</h2>
      {state.cart.length === 0 ? (
        <div className="text-center py-20 bg-stone-900/50 rounded-xl border border-stone-800">
          <ShoppingBag size={48} className="mx-auto text-stone-600 mb-4" />
          <p className="text-stone-400 text-lg">Your cart is empty.</p>
          <button onClick={() => navigate(ViewState.MENU)} className="mt-6 text-gold-400 hover:text-gold-300 underline">Browse Menu</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {state.cart.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-stone-800/50 rounded-xl border border-stone-700 items-center">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-stone-200">{item.name}</h4>
                  <p className="text-gold-400">${item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-300"><Minus size={16} /></button>
                  <span className="text-stone-200 w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-300"><Plus size={16} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-stone-500 hover:text-red-500"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-stone-800/80 p-6 rounded-xl border border-stone-700 sticky top-28">
              <h3 className="text-xl font-bold text-stone-100 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-6 text-stone-400">
                <div className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (10%)</span><span>${(cartTotal * 0.1).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>$5.00</span></div>
                <div className="border-t border-stone-700 my-2 pt-2 flex justify-between text-gold-400 font-bold text-lg">
                  <span>Total</span>
                  <span>${(cartTotal * 1.1 + 5).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => navigate(ViewState.CHECKOUT)} className="w-full py-3 bg-gold-500 text-stone-900 font-bold uppercase tracking-wider rounded-lg hover:bg-gold-400 transition">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const Checkout = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      placeOrder(formData);
    };

    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-stone-800/50 backdrop-blur-md p-8 rounded-2xl border border-stone-700">
          <h2 className="text-3xl font-serif text-gold-400 mb-8">Checkout</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-stone-400 text-sm uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-stone-500" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 pl-12 pr-4 text-stone-200 focus:border-gold-500 focus:outline-none transition" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-stone-400 text-sm uppercase tracking-wide">Phone Number (Required for confirmation)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-stone-500" size={18} />
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 pl-12 pr-4 text-stone-200 focus:border-gold-500 focus:outline-none transition" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-stone-400 text-sm uppercase tracking-wide">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-stone-500" size={18} />
                <textarea 
                  required
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg py-3 pl-12 pr-4 text-stone-200 focus:border-gold-500 focus:outline-none transition resize-none h-24 pt-3" 
                ></textarea>
              </div>
            </div>
            <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-700 mb-6">
              <h4 className="text-stone-300 font-bold mb-2">Payment Method</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="text-gold-500 focus:ring-gold-500 bg-stone-800 border-stone-600" />
                  <span className="text-stone-400">Credit Card</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" className="text-gold-500 focus:ring-gold-500 bg-stone-800 border-stone-600" />
                  <span className="text-stone-400">Cash on Delivery</span>
                </label>
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-gold-500 text-stone-900 font-bold uppercase tracking-wider rounded-lg hover:bg-gold-400 transition transform hover:scale-[1.01] shadow-lg shadow-gold-500/20">
              Place Order & Verify
            </button>
          </form>
        </div>
      </div>
    );
  };

  const Tracking = () => (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-4xl mx-auto">
      {state.orders.length === 0 ? (
        <div className="text-center">No orders found.</div>
      ) : (
        <div className="space-y-8">
          <h2 className="text-3xl font-serif text-gold-400 mb-8">Order Tracking</h2>
          {[...state.orders].reverse().map(order => (
             <div key={order.id} className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b border-stone-700 pb-4">
                  <div>
                    <span className="text-stone-500 text-sm uppercase">Order ID</span>
                    <h3 className="text-xl font-bold text-stone-200">#{order.id}</h3>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'confirmed' ? 'bg-green-900 text-green-300' : 
                      order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-stone-700 text-stone-300'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <h4 className="text-stone-400 text-sm uppercase font-bold">Progress</h4>
                    <div className="relative pl-8 space-y-8 border-l border-stone-700 ml-3">
                       {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((step, idx) => {
                         const statusIdx = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status);
                         const isCompleted = idx <= statusIdx;
                         
                         return (
                           <div key={step} className="relative">
                             <div className={`absolute -left-[39px] w-6 h-6 rounded-full border-4 border-stone-800 ${isCompleted ? 'bg-gold-500' : 'bg-stone-700'}`}></div>
                             <p className={`text-sm font-bold uppercase ${isCompleted ? 'text-gold-400' : 'text-stone-600'}`}>{step.replace(/_/g, ' ')}</p>
                           </div>
                         );
                       })}
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 bg-stone-900/50 p-4 rounded-lg">
                    <h4 className="text-stone-400 text-sm uppercase font-bold mb-3">Items</h4>
                    <ul className="space-y-2 text-stone-300 text-sm">
                      {order.items.map((i, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{i.quantity}x {i.name}</span>
                          <span>${(i.price * i.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-stone-700 mt-3 pt-3 flex justify-between font-bold text-gold-400">
                      <span>Total</span>
                      <span>${((order.total * 1.1) + 5).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );

  const Admin = () => (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-serif text-gold-400 mb-8">Admin Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-stone-200 mb-4 flex items-center gap-2"><ShoppingBag /> Recent Orders</h3>
          <div className="space-y-4">
            {[...state.orders].reverse().slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 bg-stone-900/50 rounded-lg">
                <div>
                   <div className="font-bold text-stone-200">#{order.id}</div>
                   <div className="text-xs text-stone-500">{order.customerName}</div>
                </div>
                <div className="flex gap-2">
                   <select 
                    value={order.status} 
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setState(prev => ({
                        ...prev,
                        orders: prev.orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
                      }));
                    }}
                    className="bg-stone-800 border border-stone-700 text-xs rounded px-2 py-1 text-stone-300 outline-none focus:border-gold-500"
                   >
                     <option value="pending">Pending</option>
                     <option value="confirmed">Confirmed</option>
                     <option value="preparing">Preparing</option>
                     <option value="out_for_delivery">Out for Delivery</option>
                     <option value="delivered">Delivered</option>
                   </select>
                </div>
              </div>
            ))}
            {state.orders.length === 0 && <p className="text-stone-500 italic">No active orders</p>}
          </div>
        </div>
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-stone-200 mb-4 flex items-center gap-2"><UtensilsCrossed /> Menu Management</h3>
          <div className="space-y-2">
             {MENU_ITEMS.slice(0, 4).map(item => (
               <div key={item.id} className="flex justify-between p-2 border-b border-stone-700 last:border-0">
                 <span className="text-stone-300">{item.name}</span>
                 <span className="text-gold-500">${item.price}</span>
               </div>
             ))}
             <button className="w-full mt-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded text-sm font-bold uppercase">Manage All Items</button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Voice Agent Modal (Gemini Live API) ---
  
  const VoiceConfirmationModal = () => {
    const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'closed'>('connecting');
    const [geminiService] = useState(() => new GeminiLiveService(process.env.API_KEY || ''));
    
    // Auto-connect when modal opens
    useEffect(() => {
      if (!state.currentOrder) return;

      const orderDetails = state.currentOrder.items.map(i => `${i.quantity} ${i.name}`).join(', ');
      const total = ((state.currentOrder.total * 1.1) + 5).toFixed(2);
      
      const systemInstruction = `
        You are "Otto", the AI concierge for Daddy's Kitchen. 
        A customer named ${state.currentOrder.customerName} has just placed an order.
        Order details: ${orderDetails}.
        Total amount: $${total} (including tax and delivery).
        Estimated delivery: 45 minutes.
        
        Your Goal: 
        1. Greet the customer warmly by name.
        2. Briefly confirm the items and the total.
        3. Ask if they want to add any cutlery or condiments.
        4. If they confirm, say "Great, your order is confirmed!" and end the conversation politely.
        
        Keep your responses very short, professional, and warm. Do not hallucinate items not in the list.
      `;

      const startSession = async () => {
        try {
          await geminiService.connect({
            apiKey: process.env.API_KEY || '',
            systemInstruction,
            onAudioData: () => setStatus('speaking'),
            onTranscript: () => {},
            onClose: () => {
              // Mark order as confirmed in UI if we were active
              if (state.isVoiceAgentOpen) {
                  setState(prev => ({ 
                      ...prev, 
                      isVoiceAgentOpen: false, 
                      orders: prev.orders.map(o => o.id === state.currentOrder?.id ? { ...o, status: 'confirmed' } : o)
                  }));
              }
            }
          });
          setStatus('listening');
        } catch (e) {
          console.error("Failed to connect voice agent", e);
          setStatus('closed');
        }
      };

      startSession();

      return () => {
        geminiService.disconnect();
      };
    }, [state.currentOrder, geminiService]);

    if (!state.isVoiceAgentOpen) return null;

    const handleClose = () => {
       geminiService.disconnect();
       setState(prev => ({ ...prev, isVoiceAgentOpen: false }));
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-stone-900 border border-stone-700 w-full max-w-md rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <button onClick={handleClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300">
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                status === 'speaking' ? 'bg-gold-500 shadow-[0_0_40px_rgba(234,179,8,0.6)] scale-110' :
                status === 'listening' ? 'bg-stone-700 animate-pulse' : 'bg-stone-800'
              }`}>
                <Mic size={40} className={status === 'speaking' ? 'text-stone-900' : 'text-stone-400'} />
              </div>
              {status === 'speaking' && (
                <div className="absolute inset-0 rounded-full border-2 border-gold-500 animate-[ping_1.5s_ease-in-out_infinite]"></div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-serif text-stone-100 mb-2">Order Verification</h3>
              <p className="text-stone-400">
                {status === 'connecting' && "Connecting to restaurant concierge..."}
                {status === 'listening' && "Otto is listening..."}
                {status === 'speaking' && "Otto is speaking..."}
              </p>
            </div>

            <div className="bg-stone-800/50 p-4 rounded-lg text-sm text-stone-500 w-full">
              <p className="mb-2 uppercase text-xs font-bold tracking-widest text-stone-600">Live Agent Context</p>
              <p>Reviewing order for <span className="text-stone-300">{state.currentOrder?.customerName}</span>...</p>
            </div>

            <button 
              onClick={handleClose}
              className="px-6 py-2 border border-stone-700 rounded-full text-stone-400 hover:text-white hover:border-stone-500 transition text-sm"
            >
              End Call
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-900 min-h-screen text-stone-100 font-sans selection:bg-gold-500/30">
      <Navbar />
      
      {state.view === ViewState.HOME && <Hero />}
      {state.view === ViewState.MENU && <Menu />}
      {state.view === ViewState.BOOKING && <BookingView />}
      {state.view === ViewState.CART && <Cart />}
      {state.view === ViewState.CHECKOUT && <Checkout />}
      {state.view === ViewState.TRACKING && <Tracking />}
      {state.view === ViewState.ADMIN && <Admin />}

      <VoiceConfirmationModal />

      <footer className="bg-stone-950 border-t border-stone-900 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-serif text-gold-500 mb-2">Daddy's Kitchen</h4>
            <p className="text-stone-500 text-sm">Premium Dining & Exquisite Flavors</p>
          </div>
          <div className="text-stone-600 text-sm text-center">
            &copy; {new Date().getFullYear()} Daddy's Kitchen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
