import { useEffect, useState } from 'react';
import { Package, Wrench, FileText, User, ChevronRight, Truck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import type { Order, ServiceRequest, Quote } from '@/types/database';

type Tab = 'orders' | 'services' | 'quotes' | 'profile';

export function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: ordersData }, { data: srData }] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('service_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setOrders((ordersData as Order[]) || []);
      setServiceRequests((srData as ServiceRequest[]) || []);

      if (srData && srData.length > 0) {
        const requestIds = (srData as ServiceRequest[]).map((r) => r.id);
        const { data: quotesData } = await supabase
          .from('quotes')
          .select('*')
          .in('service_request_id', requestIds)
          .order('created_at', { ascending: false });
        setQuotes((quotesData as Quote[]) || []);
      }
      setDataLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="container-max px-4 py-20 flex justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-max px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-crown-900">Sign in to view your account</h2>
          <p className="mt-2 text-crown-500">Access your orders, service requests, and quotes.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signin" className="btn-primary">Sign In</Link>
            <Link to="/signup" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Package; count: number }[] = [
    { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
    { id: 'services', label: 'Service Requests', icon: Wrench, count: serviceRequests.length },
    { id: 'quotes', label: 'Quotes', icon: FileText, count: quotes.length },
    { id: 'profile', label: 'Profile', icon: User, count: 0 },
  ];

  const statusVariant = (status: string): 'copper' | 'success' | 'warning' | 'danger' | 'neutral' => {
    if (['paid', 'delivered', 'completed', 'accepted', 'scheduled'].includes(status)) return 'success';
    if (['pending', 'confirmed', 'submitted', 'under_review', 'draft', 'processing'].includes(status)) return 'warning';
    if (['cancelled', 'failed', 'declined', 'expired', 'no_show', 'refunded'].includes(status)) return 'danger';
    if (['shipped', 'out_for_delivery', 'quoted', 'sent', 'in_progress'].includes(status)) return 'copper';
    return 'neutral';
  };

  const statusIcon = (status: string) => {
    if (['delivered', 'completed', 'accepted'].includes(status)) return <CheckCircle2 className="w-4 h-4" />;
    if (['cancelled', 'failed', 'declined'].includes(status)) return <XCircle className="w-4 h-4" />;
    if (['shipped', 'out_for_delivery'].includes(status)) return <Truck className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-900 text-white py-12">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl lg:text-3xl font-bold">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Customer'}
          </h1>
          <p className="mt-1 text-crown-400">{user.email}</p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-4 sticky top-24">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-crown-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center text-white font-bold text-lg">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-crown-900 text-sm truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-crown-400 truncate">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        tab === t.id
                          ? 'bg-copper-50 text-copper-700'
                          : 'text-crown-600 hover:bg-crown-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </span>
                      {t.count > 0 && (
                        <span className="text-xs bg-crown-100 text-crown-600 px-2 py-0.5 rounded-full">
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              <button
                onClick={() => { signOut(); navigate('/'); }}
                className="w-full mt-4 px-3 py-2.5 rounded-lg text-sm font-medium text-crown-600 hover:bg-crown-50 transition-colors text-left"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {dataLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size={36} />
              </div>
            ) : (
              <>
                {/* Orders Tab */}
                {tab === 'orders' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-crown-900">Your Orders</h2>
                    {orders.length === 0 ? (
                      <EmptyState
                        icon={<Package className="w-12 h-12" />}
                        title="No orders yet"
                        description="When you place an order, it will appear here."
                        action={<Link to="/products" className="btn-primary">Shop Products</Link>}
                      />
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="card p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div>
                              <p className="font-semibold text-crown-900">{order.order_number}</p>
                              <p className="text-xs text-crown-400">{formatDate(order.created_at)}</p>
                            </div>
                            <Badge variant={statusVariant(order.status)}>
                              {statusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-crown-100">
                            <div className="text-sm text-crown-500">
                              {order.shipping_name} · {order.shipping_city}, {order.shipping_state}
                            </div>
                            <p className="font-bold text-copper-600">{formatPrice(order.total_cents)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Service Requests Tab */}
                {tab === 'services' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-crown-900">Service Requests</h2>
                      <Link to="/service-request" className="btn-primary text-sm">New Request</Link>
                    </div>
                    {serviceRequests.length === 0 ? (
                      <EmptyState
                        icon={<Wrench className="w-12 h-12" />}
                        title="No service requests"
                        description="Request a service and track its progress here."
                        action={<Link to="/services" className="btn-primary">Browse Services</Link>}
                      />
                    ) : (
                      serviceRequests.map((req) => (
                        <div key={req.id} className="card p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div>
                              <p className="font-semibold text-crown-900">{req.service_name}</p>
                              <p className="text-xs text-crown-400">{req.request_number} · {formatDate(req.created_at)}</p>
                            </div>
                            <Badge variant={statusVariant(req.status)}>
                              {statusIcon(req.status)}
                              <span className="ml-1 capitalize">{req.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-crown-500 line-clamp-2">{req.description}</p>
                          {req.urgency === 'emergency' && (
                            <div className="mt-2">
                              <Badge variant="danger">Emergency</Badge>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Quotes Tab */}
                {tab === 'quotes' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-crown-900">Your Quotes</h2>
                    {quotes.length === 0 ? (
                      <EmptyState
                        icon={<FileText className="w-12 h-12" />}
                        title="No quotes yet"
                        description="Quotes from our team will appear here after you submit a service request."
                        action={<Link to="/service-request" className="btn-primary">Request a Quote</Link>}
                      />
                    ) : (
                      quotes.map((quote) => (
                        <div key={quote.id} className="card p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div>
                              <p className="font-semibold text-crown-900">{quote.quote_number}</p>
                              <p className="text-xs text-crown-400">{formatDate(quote.created_at)}</p>
                            </div>
                            <Badge variant={statusVariant(quote.status)}>
                              <span className="capitalize">{quote.status}</span>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-crown-100 text-sm">
                            <div>
                              <p className="text-crown-400 text-xs">Labor</p>
                              <p className="font-semibold text-crown-900">{formatPrice(quote.labor_cents)}</p>
                            </div>
                            <div>
                              <p className="text-crown-400 text-xs">Materials</p>
                              <p className="font-semibold text-crown-900">{formatPrice(quote.materials_cents)}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-crown-100 flex items-center justify-between">
                            <span className="text-sm font-medium text-crown-600">Total Estimate</span>
                            <span className="font-bold text-copper-600 text-lg">{formatPrice(quote.estimated_cost_cents)}</span>
                          </div>
                          {quote.customer_notes && (
                            <p className="mt-2 text-xs text-crown-400 italic">{quote.customer_notes}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Profile Tab */}
                {tab === 'profile' && (
                  <div className="card p-6">
                    <h2 className="text-xl font-bold text-crown-900 mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-crown-400 font-medium uppercase tracking-wider">Full Name</p>
                          <p className="text-sm text-crown-900 mt-0.5">{profile?.full_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-crown-400 font-medium uppercase tracking-wider">Email</p>
                          <p className="text-sm text-crown-900 mt-0.5">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-crown-400 font-medium uppercase tracking-wider">Phone</p>
                          <p className="text-sm text-crown-900 mt-0.5">{profile?.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-crown-400 font-medium uppercase tracking-wider">Company</p>
                          <p className="text-sm text-crown-900 mt-0.5">{profile?.company || '—'}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-crown-100">
                        <p className="text-xs text-crown-400 font-medium uppercase tracking-wider mb-1">Member Since</p>
                        <p className="text-sm text-crown-900">{formatDate(profile?.created_at || new Date())}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
