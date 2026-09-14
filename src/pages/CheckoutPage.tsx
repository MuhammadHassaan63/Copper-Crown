import { useState } from 'react';
import { Check, CreditCard, Lock, ShieldCheck, ArrowLeft, AlertCircle, Truck, Store, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber } from '@/lib/format';
import { Link, useRouter } from '@/context/RouterContext';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Loading';
import type { DeliveryMethod } from '@/types/database';

export function CheckoutPage() {
  const { items, subtotalCents, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<string>('');

  const [form, setForm] = useState({
    shipping_name: profile?.full_name || '',
    shipping_email: user?.email || '',
    shipping_phone: profile?.phone || '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    delivery_method: 'standard' as DeliveryMethod,
    notes: '',
  });

  const [payment, setPayment] = useState({
    card_number: '',
    card_name: '',
    expiry: '',
    cvc: '',
  });

  const deliveryCosts: Record<DeliveryMethod, number> = {
    standard: subtotalCents >= 10000 ? 0 : 25000,
    express: 50000,
    pickup: 0,
  };

  const shippingCents = deliveryCosts[form.delivery_method];
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents;

  const updateForm = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const updatePayment = (key: string, value: string) => setPayment((p) => ({ ...p, [key]: value }));

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="container-max px-4 py-20">
        <EmptyState
          title="Your cart is empty"
          description="Add some products before checking out."
          action={<Link to="/products" className="btn-primary">Shop Products</Link>}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-max px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-crown-900">Sign in to checkout</h2>
          <p className="mt-2 text-crown-500">
            You need an account to complete your purchase and track your order.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signin" className="btn-primary">Sign In</Link>
            <Link to="/signup" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (completedOrder) {
    return (
      <div className="container-max px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-crown-900">Order Placed Successfully!</h2>
          <p className="mt-2 text-crown-500">
            Your order number is <span className="font-bold text-copper-600">{completedOrder}</span>.
            You can track your order status anytime using this number.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/account" className="btn-primary">Track Your Order</Link>
            <Link to="/track-order" className="btn-secondary">Track by Order Number</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const orderNumber = generateOrderNumber();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'confirmed',
          payment_status: 'unpaid',
          stripe_payment_intent_id: '',
          subtotal_cents: subtotalCents,
          shipping_cents: shippingCents,
          tax_cents: taxCents,
          total_cents: totalCents,
          delivery_method: form.delivery_method,
          shipping_name: form.shipping_name,
          shipping_email: form.shipping_email,
          shipping_phone: form.shipping_phone,
          shipping_address: form.shipping_address,
          shipping_city: form.shipping_city,
          shipping_state: form.shipping_state,
          shipping_zip: form.shipping_zip,
          shipping_country: 'PK',
          notes: form.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        unit_price_cents: item.product.price_cents,
        quantity: item.quantity,
        line_total_cents: item.product.price_cents * item.quantity,
        image_url: item.product.image_url,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      setCompletedOrder(orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => (step === 'payment' ? setStep('info') : navigate('/cart'))}
          className="flex items-center gap-1.5 text-sm text-crown-500 hover:text-copper-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'payment' ? 'Back to Delivery' : 'Back to Cart'}
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-crown-900 mb-6">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <div className={`flex items-center gap-2 ${step === 'info' ? 'text-copper-600 font-semibold' : 'text-crown-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'info' ? 'bg-copper-500 text-white' : 'bg-crown-200 text-crown-500'}`}>1</span>
            Delivery
          </div>
          <div className="w-8 h-px bg-crown-200" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-copper-600 font-semibold' : 'text-crown-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-copper-500 text-white' : 'bg-crown-200 text-crown-500'}`}>2</span>
            Payment
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {step === 'info' ? (
              <form onSubmit={handleContinueToPayment} className="card p-6 space-y-5">
                <h3 className="font-bold text-crown-900">Delivery Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.shipping_name} onChange={(e) => updateForm('shipping_name', e.target.value)} required />
                  <Input label="Phone Number" type="tel" placeholder="03XX-XXXXXXX" value={form.shipping_phone} onChange={(e) => updateForm('shipping_phone', e.target.value)} required />
                </div>
                <Input label="Email" type="email" value={form.shipping_email} onChange={(e) => updateForm('shipping_email', e.target.value)} required />
                <Input label="Street Address" value={form.shipping_address} onChange={(e) => updateForm('shipping_address', e.target.value)} required />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="City" value={form.shipping_city} onChange={(e) => updateForm('shipping_city', e.target.value)} required />
                  <Input label="Province" placeholder="e.g. Sindh" value={form.shipping_state} onChange={(e) => updateForm('shipping_state', e.target.value)} />
                  <Input label="Postal Code" value={form.shipping_zip} onChange={(e) => updateForm('shipping_zip', e.target.value)} />
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="label-field">Delivery Method</label>
                  <div className="space-y-2">
                    {[
                      { value: 'standard', label: 'Standard Delivery', desc: '3-5 business days', cost: deliveryCosts.standard, icon: Truck },
                      { value: 'express', label: 'Express Delivery', desc: '1-2 business days', cost: deliveryCosts.express, icon: Zap },
                      { value: 'pickup', label: 'Store Pickup', desc: 'Pick up from our store', cost: 0, icon: Store },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            form.delivery_method === opt.value
                              ? 'border-copper-500 bg-copper-50'
                              : 'border-crown-200 hover:border-crown-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery_method"
                            value={opt.value}
                            checked={form.delivery_method === opt.value}
                            onChange={(e) => updateForm('delivery_method', e.target.value)}
                            className="sr-only"
                          />
                          <Icon className={`w-5 h-5 ${form.delivery_method === opt.value ? 'text-copper-600' : 'text-crown-400'}`} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-crown-900">{opt.label}</p>
                            <p className="text-xs text-crown-400">{opt.desc}</p>
                          </div>
                          <span className="text-sm font-semibold text-crown-700">
                            {opt.cost === 0 ? 'Free' : formatPrice(opt.cost)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label-field">Order Notes (Optional)</label>
                  <textarea
                    className="input-field min-h-[80px] resize-y"
                    placeholder="Special delivery instructions..."
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" fullWidth>
                  Continue to Payment
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePlaceOrder} className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-crown-900">Payment</h3>
                  <div className="flex items-center gap-1.5 text-xs text-crown-400">
                    <Lock className="w-3.5 h-3.5" />
                    Secure Checkout
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Payment Gateway Ready for Integration</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Your order will be placed and confirmed. Online payment will be
                      processed securely once a payment gateway is connected. You can pay
                      via cash on delivery or bank transfer in the meantime — our team will
                      contact you with payment instructions.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-crown-50 rounded-lg">
                  <p className="text-sm text-crown-600">
                    Your order will be created with status <span className="font-semibold">"Confirmed"</span>.
                    Our team will contact you at <span className="font-semibold">{form.shipping_phone}</span> to
                    arrange payment and delivery.
                  </p>
                </div>

                <Button type="submit" disabled={submitting} size="lg" fullWidth>
                  {submitting ? 'Placing Order...' : (
                    <>
                      <Check className="w-5 h-5" />
                      Place Order — {formatPrice(totalCents)}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-crown-900 mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-crown-50 flex-shrink-0">
                      {item.product.image_url && (
                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-crown-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-crown-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-crown-900">
                      {formatPrice(item.product.price_cents * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-crown-100 pt-3">
                <div className="flex justify-between text-crown-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-crown-600">
                  <span>Delivery</span>
                  <span className="font-semibold">{shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}</span>
                </div>
                <div className="pt-2 border-t border-crown-100 flex justify-between">
                  <span className="font-bold text-crown-900">Total</span>
                  <span className="font-bold text-copper-600 text-lg">{formatPrice(totalCents)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
