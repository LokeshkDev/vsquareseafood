import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/order.service';

export default function Checkout() {
  const { 
    cart, 
    cartSubtotal, 
    deliveryFee, 
    packagingFee, 
    grandTotal, 
    clearCart,
    deliveryLocation,
    deliveryFeeLabel,
    packagingFeeLabel,
    isDeliveryFeeEnabled,
    isPackagingFeeEnabled
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate earliest selectable date (tomorrow onwards)
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayAfterTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const tomorrowStr = getTomorrowStr();
  const dayAfterTomorrowStr = getDayAfterTomorrowStr();

  // 1. Dynamic Address details (no static dummy values)
  const [addressDetails, setAddressDetails] = useState({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    flatNo: '',
    street: '',
    landmark: '',
    city: deliveryLocation || 'Chennai',
    pincode: '',
    state: 'Tamil Nadu',
  });

  // Update when user loads or delivery location changes
  useEffect(() => {
    if (user) {
      setAddressDetails(prev => ({
        ...prev,
        name: prev.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // 2. Delivery Slot: Date (tomorrow onwards) & Time (6:00 AM - 6:00 PM only)
  const [deliveryDate, setDeliveryDate] = useState(tomorrowStr);

  const TIME_SLOTS = [
    { id: '06:00 AM - 08:00 AM', label: '06:00 AM – 08:00 AM', tag: 'Morning Catch' },
    { id: '08:00 AM - 10:00 AM', label: '08:00 AM – 10:00 AM', tag: 'Breakfast Prep' },
    { id: '10:00 AM - 12:00 PM', label: '10:00 AM – 12:00 PM', tag: 'Pre-Lunch' },
    { id: '12:00 PM - 02:00 PM', label: '12:00 PM – 02:00 PM', tag: 'Lunch Catch' },
    { id: '02:00 PM - 04:00 PM', label: '02:00 PM – 04:00 PM', tag: 'Afternoon' },
    { id: '04:00 PM - 06:00 PM', label: '04:00 PM – 06:00 PM', tag: 'Early Evening' },
  ];

  const [deliveryTime, setDeliveryTime] = useState(TIME_SLOTS[0].id);

  // 3. Payment Method: Strictly Online Payment and COD
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800">Your cart is empty</h2>
          <p className="text-xs text-slate-500">Add fresh seafood or cloud kitchen delicacies to proceed.</p>
          <Link to="/shop" className="inline-block bg-ocean-900 text-white px-4 py-2 rounded-[5px] text-xs font-bold hover:bg-ocean-800 transition">
            Explore Fresh Catch
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!addressDetails.name.trim()) {
      setErrorMessage('Please enter recipient full name');
      return;
    }
    const cleanPhone = addressDetails.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!addressDetails.flatNo.trim()) {
      setErrorMessage('Please enter house/flat/building details');
      return;
    }
    if (!addressDetails.street.trim()) {
      setErrorMessage('Please enter street or area name');
      return;
    }
    const cleanPin = addressDetails.pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit postal pincode');
      return;
    }
    if (!deliveryDate || deliveryDate < tomorrowStr) {
      setErrorMessage('Please select a delivery date starting from tomorrow onwards');
      return;
    }
    if (!deliveryTime) {
      setErrorMessage('Please select a delivery time between 6:00 AM and 6:00 PM');
      return;
    }

    setSubmitting(true);

    try {
      const orderItems = cart.map((item) => {
        const cut = item.cleaningOption || item.selectedCut || 'whole-cleaned';
        const matchingVariant = item.product?.variants?.find(
          (v) => (v.cleaningOption && v.cleaningOption.toLowerCase() === cut.toLowerCase()) ||
                 (v.cutType && v.cutType.toLowerCase() === cut.toLowerCase())
        );
        return {
          productId: item.productId || item.product?.id,
          variantId: matchingVariant?.id || item.product?.variants?.[0]?.id,
          name: item.product?.name || 'Fresh Seafood',
          cleaningOption: cut,
          cutPreference: cut,
          unitPrice: Number(item.unitPrice || item.product?.price || 0),
          quantity: Math.max(1, Number(item.quantity) || 1),
          subtotal: Number(item.unitPrice || item.product?.price || 0) * Math.max(1, Number(item.quantity) || 1),
        };
      });

      const payload = {
        items: orderItems,
        address: {
          name: addressDetails.name.trim(),
          phone: cleanPhone,
          flatNo: addressDetails.flatNo.trim(),
          street: addressDetails.street.trim(),
          landmark: addressDetails.landmark.trim(),
          city: addressDetails.city.trim() || 'Chennai',
          state: addressDetails.state || 'Tamil Nadu',
          pincode: cleanPin,
        },
        deliverySlot: {
          date: deliveryDate,
          time: deliveryTime,
        },
        paymentMethod: paymentMethod === 'online' ? 'ONLINE' : 'COD',
        deliveryCharge: Number(deliveryFee) || 0,
        packagingFee: Number(packagingFee) || 0,
        subtotal: Number(cartSubtotal) || 0,
        total: Number(grandTotal) || 0,
        notes: `Delivery Scheduled: ${deliveryDate} between ${deliveryTime}. Payment mode: ${paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}`,
      };

      const result = await orderService.createOrder(payload);
      const createdOrder = result?.data || result;

      setPlacedOrder(createdOrder);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'Failed to place order. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Confirmation Success View
  if (orderPlaced && placedOrder) {
    const orderNumber = placedOrder.orderNumber || placedOrder.id?.slice(0, 8).toUpperCase() || 'V2S-ORDER';
    let parsedAddress = {};
    try {
      parsedAddress = typeof placedOrder.addressSnapshot === 'string'
        ? JSON.parse(placedOrder.addressSnapshot)
        : (placedOrder.addressSnapshot || {});
    } catch (e) {}

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-[5px] p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-[5px] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-[3px] border border-emerald-200">
              Order Confirmed & Sent to Fulfillment
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Fresh Seafood is Booked!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Order Number: <strong className="text-slate-900 font-mono">{orderNumber}</strong>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-[5px] p-3.5 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Scheduled Delivery Date:</span>
              <strong className="text-slate-900">{parsedAddress.deliveryDate || deliveryDate}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Delivery Slot (6AM – 6PM):</span>
              <strong className="text-ocean-700 font-bold">{parsedAddress.deliveryTime || deliveryTime}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Payment Method:</span>
              <strong className="text-slate-900 uppercase">
                {paymentMethod === 'online' ? 'Online Payment (Razorpay / UPI)' : 'Cash on Delivery (COD)'}
              </strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Total Payable:</span>
              <strong className="text-slate-900 font-black">₹{Number(placedOrder.total || grandTotal).toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
              <span className="font-medium">Destination:</span>
              <span className="text-right text-slate-700 max-w-[200px] truncate font-medium">
                {parsedAddress.flatNo || addressDetails.flatNo}, {parsedAddress.street || addressDetails.street}, {parsedAddress.pincode || addressDetails.pincode}
              </span>
            </div>

            {/* Chosen Cuts & Items */}
            {(placedOrder.items || parsedAddress.items) && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Chosen Cuts & Items:
                </span>
                <div className="divide-y divide-slate-100 bg-white rounded border border-slate-200 overflow-hidden">
                  {(placedOrder.items || parsedAddress.items).map((it, idx) => {
                    const name = it.productNameSnapshot || it.name || it.product?.name || 'Seafood';
                    const cut = it.variantNameSnapshot || it.cutPreference || 'Whole Cleaned';
                    return (
                      <div key={idx} className="p-2 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-900">{it.quantity || 1}x {name}</span>
                          <span className="block text-[10px] text-ocean-700 font-bold capitalize">
                            Cleaning & Cut: {cut}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          ₹{Number(it.subtotal || (it.unitPrice * (it.quantity || 1)) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 bg-emerald-50/50 p-2.5 rounded-[4px] border border-emerald-100">
            Order confirmed for morning harbor catch cut to your preference. Tracking updates will be delivered to <strong>+91 {addressDetails.phone}</strong>.
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-xs py-3 rounded-[5px] transition"
            >
              Back to Homepage
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 rounded-[5px] border border-slate-200 transition"
            >
              Shop More Fresh Seafood
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-ocean-900 transition mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
          Checkout & Order Confirmation
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-[5px] bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600 font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Delivery Address, Slot, Payment */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 1. Delivery Address Card (No Static Content) */}
            <div className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sea-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    1. Delivery & Contact Details
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Required for harbor cold chain</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arun Kumar"
                    value={addressDetails.name}
                    onChange={(e) => setAddressDetails({ ...addressDetails, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[5px] outline-none focus:border-ocean-800 focus:bg-white text-slate-800 font-medium transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    10-Digit Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9840123456"
                    value={addressDetails.phone}
                    onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[5px] outline-none focus:border-ocean-800 focus:bg-white text-slate-800 font-medium transition"
                  />
                </div>
              </div>

              <div className="text-xs space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    House / Flat / Door No. & Apartment Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 4B, Ocean View Apartments"
                    value={addressDetails.flatNo}
                    onChange={(e) => setAddressDetails({ ...addressDetails, flatNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[5px] outline-none focus:border-ocean-800 focus:bg-white text-slate-800 font-medium transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Street / Area / Locality <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2nd Main Road, Besant Nagar"
                      value={addressDetails.street}
                      onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[5px] outline-none focus:border-ocean-800 focus:bg-white text-slate-800 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Beach Police Station"
                      value={addressDetails.landmark}
                      onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[5px] outline-none focus:border-ocean-800 focus:bg-white text-slate-800 font-medium transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      City / Hub <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[5px] outline-none focus:border-ocean-800 focus:bg-white text-slate-800 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Pincode <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 600090"
                      value={addressDetails.pincode}
                      onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[5px] outline-none focus:border-ocean-800 focus:bg-white text-slate-800 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={addressDetails.state}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-[5px] text-slate-600 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Choose Delivery Slot (Next Day Onwards & 6:00 AM – 6:00 PM Only) */}
            <div className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sea-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    2. Choose Delivery Slot
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[3px] border border-emerald-200">
                  Next-Day Harbor Catch • 6 AM – 6 PM Only
                </span>
              </div>

              {/* Step A: Select Date (Next Day Onwards) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ocean-600" />
                  <span>Select Delivery Date (Enabled from Next Day) <span className="text-rose-500">*</span></span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryDate(tomorrowStr)}
                    className={`p-3 rounded-[5px] border cursor-pointer text-left transition flex items-center justify-between ${
                      deliveryDate === tomorrowStr
                        ? 'border-ocean-800 bg-ocean-50/60 ring-1 ring-ocean-800 font-bold text-ocean-900'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-ocean-700 font-extrabold">Tomorrow</div>
                      <div className="text-xs font-bold mt-0.5">
                        {new Date(tomorrowStr).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    {deliveryDate === tomorrowStr && <Check className="w-4 h-4 text-ocean-800" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryDate(dayAfterTomorrowStr)}
                    className={`p-3 rounded-[5px] border cursor-pointer text-left transition flex items-center justify-between ${
                      deliveryDate === dayAfterTomorrowStr
                        ? 'border-ocean-800 bg-ocean-50/60 ring-1 ring-ocean-800 font-bold text-ocean-900'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Day After Tomorrow</div>
                      <div className="text-xs font-bold mt-0.5">
                        {new Date(dayAfterTomorrowStr).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    {deliveryDate === dayAfterTomorrowStr && <Check className="w-4 h-4 text-ocean-800" />}
                  </button>

                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full h-full p-2.5 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-ocean-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step B: Select Time (Morning 6:00 AM to 6:00 PM only) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-ocean-600" />
                    <span>Select Time Slot (Morning 6:00 AM – 6:00 PM Only) <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">No night or late evening slots</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = deliveryTime === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setDeliveryTime(slot.id)}
                        className={`p-3 rounded-[5px] border cursor-pointer transition text-left ${
                          isSelected 
                            ? 'border-sea-600 bg-sea-50 ring-1 ring-sea-600 shadow-2xs' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{slot.label}</span>
                        </div>
                        <div className="text-[10px] text-sea-700 font-semibold mt-1">
                          {slot.tag}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Select Payment Method (Only Online Payment and COD) */}
            <div className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sea-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    3. Payment Method
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Choose your preferred mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Online Payment */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-[5px] border cursor-pointer transition flex items-start gap-3 ${
                    paymentMethod === 'online'
                      ? 'border-sea-600 bg-sea-50/80 ring-1 ring-sea-600 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-[5px] ${paymentMethod === 'online' ? 'bg-sea-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Online Payment</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[2px] border border-emerald-200">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      UPI (GPay, PhonePe, Paytm, QR code), Credit & Debit Cards, NetBanking.
                    </p>
                  </div>
                </div>

                {/* Cash on Delivery (COD) */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-[5px] border cursor-pointer transition flex items-start gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-sea-600 bg-sea-50/80 ring-1 ring-sea-600 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-[5px] ${paymentMethod === 'cod' ? 'bg-sea-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Cash on Delivery (COD)</span>
                      <span className="text-[9px] uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-[2px]">
                        Pay at Door
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Pay cash or scan delivery rider UPI QR upon arrival at your doorstep.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Order Summary ({cart.length} items)
            </h2>

            {/* Micro items list */}
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
              {cart.map((item) => {
                const itemUnitPrice = Number(item.unitPrice) || 0;
                const itemQty = Number(item.quantity) || 1;
                return (
                  <div key={item.id} className="py-2.5 flex justify-between items-center">
                    <div className="truncate max-w-[200px]">
                      <span className="font-bold text-slate-900">{itemQty}x</span> {item.product?.name || 'Fresh Seafood'}
                      <div className="text-[10px] text-ocean-700 font-semibold capitalize">
                        Cut: {(item.cleaningOption || 'whole-cleaned').replace(/-/g, ' ')}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">₹{itemUnitPrice * itemQty}</span>
                  </div>
                );
              })}
            </div>

            {/* Bill Details */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="font-semibold text-slate-900">₹{Number(cartSubtotal) || 0}</span>
              </div>
              {isDeliveryFeeEnabled && (
                <div className="flex justify-between">
                  <span>{deliveryFeeLabel}</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <strong className="text-emerald-600 font-bold">FREE</strong>
                    ) : (
                      `₹${Number(deliveryFee) || 0}`
                    )}
                  </span>
                </div>
              )}
              {isPackagingFeeEnabled && Number(packagingFee) > 0 && (
                <div className="flex justify-between">
                  <span>{packagingFeeLabel}</span>
                  <span className="font-semibold text-slate-900">₹{Number(packagingFee) || 0}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-ocean-900">
                <span>Total Amount</span>
                <span>₹{Number(grandTotal) || 0}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm py-3.5 px-4 rounded-[5px] transition shadow-sm border border-ocean-800 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>
                  Confirm & Place Order (₹{Number(grandTotal) || 0})
                </span>
              )}
            </button>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Harbor Freshness Guarantee • Morning 6AM–6PM Delivery</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
