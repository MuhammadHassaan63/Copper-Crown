import { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/format';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Loading';
import type { Order, OrderItem } from '@/types/database';

export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    const { data, error: queryError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim().toUpperCase())
      .maybeSingle();

    if (queryError) {
      setError('Unable to search for order. Please try again.');
      setLoading(false);
      return;
    }

    if (!data) {
      setOrder(null);
      setError('Order not found. Please check your order number.');
      setLoading(false);
      return;
    }

    setOrder(data as Order);
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', (data as Order).id);
    setItems((itemsData as OrderItem[]) || []);
    setLoading(false);
  };

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = order ? steps.findIndex((s) => s.key === order.status) : -1;
  const isCancelled = order?.status === 'cancelled' || order?.status === 'refunded';

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-900 text-white py-12">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold">Track Your Order</h1>
          <p className="mt-2 text-crown-400">
            Enter your order number to see the current status.
          </p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="card p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-crown-400" />
                <input
                  className="input-field pl-10"
                  placeholder="e.g. CC-2025-123456"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Track Order'}
              </Button>
            </div>
          </form>

          {error && (
            <div className="card p-4 mb-6 bg-red-50 border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {searched && !error && order && (
            <div className="space-y-6 animate-slide-up">
              {/* Status Timeline */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-bold text-crown-900">{order.order_number}</p>
                    <p className="text-xs text-crown-400">Placed on {formatDate(order.created_at)}</p>
                  </div>
                  <Badge variant={isCancelled ? 'danger' : 'success'}>
                    {isCancelled ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </div>

                {!isCancelled ? (
                  <div className="flex items-center justify-between">
                    {steps.map((step, i) => {
                      const Icon = step.icon;
                      const completed = i <= currentStepIndex;
                      return (
                        <div key={step.key} className="flex-1 flex flex-col items-center relative">
                          {i > 0 && (
                            <div
                              className={`absolute top-5 -left-1/2 w-full h-0.5 ${
                                i <= currentStepIndex ? 'bg-copper-500' : 'bg-crown-200'
                              }`}
                            />
                          )}
                          <div
                            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              completed ? 'bg-copper-500 text-white' : 'bg-crown-100 text-crown-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`mt-2 text-xs text-center font-medium ${completed ? 'text-crown-900' : 'text-crown-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-crown-700">This order has been {order.status}</p>
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              <div className="card p-6">
                <h3 className="font-bold text-crown-900 mb-3">Shipping Address</h3>
                <div className="text-sm text-crown-600 space-y-0.5">
                  <p className="font-medium text-crown-900">{order.shipping_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                  <p>{order.shipping_phone}</p>
                </div>
              </div>

              {/* Items */}
              <div className="card p-6">
                <h3 className="font-bold text-crown-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-crown-50 flex-shrink-0">
                        {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-crown-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-crown-400">Qty: {item.quantity} · {formatPrice(item.unit_price_cents)}</p>
                      </div>
                      <p className="font-semibold text-crown-900 text-sm">{formatPrice(item.line_total_cents)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-crown-100 flex justify-between">
                  <span className="font-bold text-crown-900">Total</span>
                  <span className="font-bold text-copper-600 text-lg">{formatPrice(order.total_cents)}</span>
                </div>
              </div>
            </div>
          )}

          {searched && !error && !order && !loading && (
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title="Order not found"
              description="Please check your order number and try again."
            />
          )}
        </div>
      </div>
    </div>
  );
}
