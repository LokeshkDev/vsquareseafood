import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ShieldCheck, 
  ArrowLeft,
  Fish
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { 
    cart, 
    cartSubtotal, 
    deliveryFee, 
    packagingFee, 
    grandTotal, 
    clearCart,
    deliveryLocation 
  } = useCart();

  const navigate = useNavigate();

  const [addressDetails, setAddressDetails] = useState({
    name: 'Lokesh Kumar',
    phone: '98400 98765',
    flatNo: 'Flat 3B, Coral Marine Apartments',
    street: '4th Cross Street, South Canal Bank Road',
    landmark: 'Near Kapaleeshwarar Temple Tank',
    location: deliveryLocation
  });

  const [deliverySlot, setDeliverySlot] = useState('express');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800">Your cart is empty</h2>
          <Link to="/shop" className="text-xs font-bold text-sea-600 underline">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const generatedId = `V2-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-[5px] p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-[5px] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[3px] border border-emerald-200">
              Order Confirmed & Processing
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Fresh Seafood is On Its Way!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Order ID: <strong className="text-slate-800">{orderId}</strong>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-[5px] p-3 text-left text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Estimated Delivery:</span>
              <strong className="text-slate-900">45 - 60 Minutes</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Hub:</span>
              <strong className="text-slate-900">Kasimedu Cold Chain Express</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode:</span>
              <strong className="text-slate-900 uppercase">{paymentMethod} (₹{grandTotal || 'Paid'})</strong>
            </div>
            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
              <span>Address:</span>
              <span className="text-right text-slate-700 max-w-[200px] truncate">{addressDetails.flatNo}, {addressDetails.location}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            A real-time SMS delivery tracking link has been sent to +91 {addressDetails.phone}.
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-ocean-800 hover:bg-ocean-700 text-white font-bold text-xs py-3 rounded-[5px] transition"
            >
              Back to Homepage
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 rounded-[5px] border border-slate-200 transition"
            >
              Shop More Fresh Catch
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
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-ocean-900 transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
          Checkout & Order Confirmation
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Delivery Address, Slot, Payment */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 1. Delivery Address Card */}
            <div className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-sea-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  1. Delivery Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addressDetails.name}
                    onChange={(e) => setAddressDetails({ ...addressDetails, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-[5px] outline-none focus:border-ocean-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">10-Digit Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={addressDetails.phone}
                    onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-[5px] outline-none focus:border-ocean-800"
                  />
                </div>
              </div>

              <div className="text-xs space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">House / Flat No & Building Name</label>
                  <input
                    type="text"
                    required
                    value={addressDetails.flatNo}
                    onChange={(e) => setAddressDetails({ ...addressDetails, flatNo: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-[5px] outline-none focus:border-ocean-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Street / Area / Landmark</label>
                  <input
                    type="text"
                    required
                    value={addressDetails.street}
                    onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-[5px] outline-none focus:border-ocean-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery City Zone</label>
                  <input
                    type="text"
                    readOnly
                    value={addressDetails.location}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-[5px] text-slate-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Slot Card */}
            <div className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Clock className="w-4 h-4 text-sea-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  2. Choose Delivery Slot
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'express', title: 'Express Delivery', time: 'In 45 - 60 Mins', badge: 'Fastest' },
                  { id: 'morning', title: 'Tomorrow Morning', time: '7:00 AM - 9:00 AM', badge: 'Fresh Catch' },
                  { id: 'evening', title: 'Evening Slot', time: '5:00 PM - 7:00 PM', badge: 'Dinner Prep' }
                ].map((slot) => {
                  const isSelected = deliverySlot === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setDeliverySlot(slot.id)}
                      className={`p-3 rounded-[5px] border cursor-pointer transition text-left ${
                        isSelected 
                          ? 'border-sea-600 bg-sea-50 ring-1 ring-sea-600' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{slot.title}</span>
                        <span className="text-[9px] uppercase font-bold text-sea-700 bg-white px-1.5 py-0.5 rounded-[2px] border border-sea-200">
                          {slot.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        {slot.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Payment Method Card */}
            <div className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-sea-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  3. Select Payment Method
                </h2>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'cod', title: 'Cash on Delivery (Pay upon arrival)', desc: 'Pay by cash or scan QR upon delivery', icon: Banknote },
                  { id: 'upi', title: 'UPI (GPay / PhonePe / Paytm / QR)', desc: 'Instant 1-click verification', icon: Smartphone },
                  { id: 'card', title: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay accepted', icon: CreditCard }
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-[5px] border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-sea-600 bg-sea-50 ring-1 ring-sea-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <method.icon className={`w-5 h-5 ${isSelected ? 'text-sea-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{method.title}</div>
                          <div className="text-[11px] text-slate-500">{method.desc}</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-[2px] border flex items-center justify-center ${isSelected ? 'bg-sea-600 border-sea-600' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 shadow-xs space-y-4 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Order Summary ({cart.length} items)
            </h2>

            {/* Micro items list */}
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              {cart.map((item) => (
                <div key={item.id} className="py-2 flex justify-between items-center">
                  <div className="truncate max-w-[190px]">
                    <span className="font-bold text-slate-800">{item.quantity}x</span> {item.product.name}
                    <div className="text-[10px] text-slate-400 capitalize">{item.cleaningOption.replace('-', ' ')}</div>
                  </div>
                  <span className="font-bold text-slate-800">₹{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Cold Chain Box & Gel Ice</span>
                <span className="font-semibold text-slate-800">₹{packagingFee}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-ocean-900">
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm py-3.5 px-4 rounded-[5px] transition shadow-sm border border-ocean-800"
            >
              Place Seafood Order (₹{grandTotal})
            </button>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Quality & Freshness Guarantee or Instant Refund</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
