import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Package, Wrench, ShoppingCart, FileText, Users,
  TrendingUp, DollarSign, Plus, Edit2, Trash2, X, Save, Check, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate, generateQuoteNumber, slugify } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import type { Product, Service, Order, ServiceRequest, Quote } from '@/types/database';

type AdminTab = 'overview' | 'products' | 'services' | 'orders' | 'requests' | 'quotes';

export function AdminPage() {
  const { user, profile, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modal state for products
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal state for services
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Modal state for quotes
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteForRequest, setQuoteForRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) return;
    (async () => {
      const [{ data: p }, { data: s }, { data: o }, { data: r }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
      ]);
      setProducts((p as Product[]) || []);
      setServices((s as Service[]) || []);
      setOrders((o as Order[]) || []);
      setRequests((r as ServiceRequest[]) || []);

      if (r && (r as ServiceRequest[]).length > 0) {
        const reqIds = (r as ServiceRequest[]).map((req) => req.id);
        const { data: q } = await supabase
          .from('quotes')
          .select('*')
          .in('service_request_id', reqIds)
          .order('created_at', { ascending: false });
        setQuotes((q as Quote[]) || []);
      }
      setDataLoading(false);
    })();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="container-max px-4 py-20 flex justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container-max px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-crown-900">Admin Access Required</h2>
          <p className="mt-2 text-crown-500">
            You need admin privileges to access this dashboard.
          </p>
          <Link to="/signin" className="btn-primary mt-4">Sign In</Link>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Package; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'services', label: 'Services', icon: Wrench, count: services.length },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: orders.length },
    { id: 'requests', label: 'Service Requests', icon: FileText, count: requests.length },
    { id: 'quotes', label: 'Quotes', icon: FileText, count: quotes.length },
  ];

  const totalRevenue = orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_cents, 0);
  const pendingOrders = orders.filter((o) => ['pending', 'paid', 'processing'].includes(o.status)).length;
  const pendingRequests = requests.filter((r) => ['submitted', 'under_review'].includes(r.status)).length;
  const pendingQuotes = quotes.filter((q) => ['draft', 'sent'].includes(q.status)).length;

  const handleSaveProduct = async (data: Partial<Product>) => {
    if (editingProduct) {
      await supabase.from('products').update(data).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert({
        ...data,
        slug: data.slug || slugify(data.name || ''),
        sku: data.sku || `CC-${Date.now().toString(36).toUpperCase()}`,
      });
    }
    setProductModal(false);
    setEditingProduct(null);
    const { data: refreshed } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((refreshed as Product[]) || []);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSaveService = async (data: Partial<Service>) => {
    if (editingService) {
      await supabase.from('services').update(data).eq('id', editingService.id);
    } else {
      await supabase.from('services').insert({
        ...data,
        slug: data.slug || slugify(data.name || ''),
      });
    }
    setServiceModal(false);
    setEditingService(null);
    const { data: refreshed } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    setServices((refreshed as Service[]) || []);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    setServices(services.filter((s) => s.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: status as Order['status'] } : o)));
  };

  const handleUpdateRequestStatus = async (reqId: string, status: string) => {
    await supabase.from('service_requests').update({ status }).eq('id', reqId);
    setRequests(requests.map((r) => (r.id === reqId ? { ...r, status: status as ServiceRequest['status'] } : r)));
  };

  const handleCreateQuote = async (data: { labor_cents: number; materials_cents: number; admin_notes: string; valid_until: string }) => {
    if (!quoteForRequest) return;
    const estimated = data.labor_cents + data.materials_cents;
    await supabase.from('quotes').insert({
      service_request_id: quoteForRequest.id,
      quote_number: generateQuoteNumber(),
      status: 'sent',
      estimated_cost_cents: estimated,
      labor_cents: data.labor_cents,
      materials_cents: data.materials_cents,
      admin_notes: data.admin_notes,
      valid_until: data.valid_until || null,
    });
    await supabase.from('service_requests').update({ status: 'quoted' }).eq('id', quoteForRequest.id);
    setRequests(requests.map((r) => (r.id === quoteForRequest.id ? { ...r, status: 'quoted' } : r)));
    const { data: refreshed } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    setQuotes((refreshed as Quote[]) || []);
    setQuoteModal(false);
    setQuoteForRequest(null);
  };

  const statusVariant = (status: string): 'copper' | 'success' | 'warning' | 'danger' | 'neutral' => {
    if (['paid', 'delivered', 'completed', 'accepted', 'scheduled'].includes(status)) return 'success';
    if (['pending', 'confirmed', 'submitted', 'under_review', 'draft', 'processing'].includes(status)) return 'warning';
    if (['cancelled', 'failed', 'declined', 'expired'].includes(status)) return 'danger';
    if (['shipped', 'out_for_delivery', 'quoted', 'sent', 'in_progress'].includes(status)) return 'copper';
    return 'neutral';
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-950 text-white py-8">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-6 h-6 text-copper-400" />
            <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-crown-400 text-sm">Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}</p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-3 sticky top-24">
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
                      {t.count !== undefined && t.count > 0 && (
                        <span className="text-xs bg-crown-100 text-crown-600 px-2 py-0.5 rounded-full">
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-4">
            {dataLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size={36} />
              </div>
            ) : (
              <>
                {/* Overview */}
                {tab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-crown-900">Overview</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
                        { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-copper-600 bg-copper-50' },
                        { label: 'Service Requests', value: requests.length, icon: Wrench, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Products', value: products.length, icon: Package, color: 'text-purple-600 bg-purple-50' },
                      ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div key={stat.label} className="card p-5">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <p className="text-2xl font-bold text-crown-900">{stat.value}</p>
                            <p className="text-xs text-crown-400 mt-0.5">{stat.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-crown-900">Action Items</h3>
                          <TrendingUp className="w-5 h-5 text-crown-400" />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                            <span className="text-amber-800">Pending Orders</span>
                            <Badge variant="warning">{pendingOrders}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                            <span className="text-blue-800">New Service Requests</span>
                            <Badge variant="copper">{pendingRequests}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-crown-50">
                            <span className="text-crown-700">Pending Quotes</span>
                            <Badge variant="neutral">{pendingQuotes}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="card p-5">
                        <h3 className="font-semibold text-crown-900 mb-3">Recent Orders</h3>
                        {orders.length === 0 ? (
                          <p className="text-sm text-crown-400">No orders yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {orders.slice(0, 5).map((o) => (
                              <div key={o.id} className="flex items-center justify-between text-sm">
                                <span className="font-medium text-crown-900">{o.order_number}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                                  <span className="text-crown-500">{formatPrice(o.total_cents)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products */}
                {tab === 'products' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-crown-900">Products</h2>
                      <Button onClick={() => { setEditingProduct(null); setProductModal(true); }} size="sm">
                        <Plus className="w-4 h-4" />
                        Add Product
                      </Button>
                    </div>
                    {products.length === 0 ? (
                      <EmptyState title="No products" description="Add your first product." />
                    ) : (
                      <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-crown-50 text-crown-600 text-left">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
                                <th className="px-4 py-3 font-semibold">Price</th>
                                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Stock</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-crown-100">
                              {products.map((p) => (
                                <tr key={p.id} className="hover:bg-crown-50/50">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                                      <span className="font-medium text-crown-900 truncate max-w-[200px]">{p.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-crown-500 hidden sm:table-cell">{p.category}</td>
                                  <td className="px-4 py-3 font-semibold text-crown-900">{formatPrice(p.price_cents)}</td>
                                  <td className="px-4 py-3 hidden sm:table-cell">
                                    <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'danger'}>
                                      {p.stock}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => { setEditingProduct(p); setProductModal(true); }} className="p-1.5 text-crown-500 hover:bg-crown-100 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Services */}
                {tab === 'services' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-crown-900">Services</h2>
                      <Button onClick={() => { setEditingService(null); setServiceModal(true); }} size="sm">
                        <Plus className="w-4 h-4" />
                        Add Service
                      </Button>
                    </div>
                    {services.length === 0 ? (
                      <EmptyState title="No services" description="Add your first service." />
                    ) : (
                      <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-crown-50 text-crown-600 text-left">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
                                <th className="px-4 py-3 font-semibold">Base Price</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-crown-100">
                              {services.map((s) => (
                                <tr key={s.id} className="hover:bg-crown-50/50">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      {s.image_url && <img src={s.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                                      <span className="font-medium text-crown-900 truncate max-w-[200px]">{s.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-crown-500 hidden sm:table-cell">{s.category}</td>
                                  <td className="px-4 py-3 font-semibold text-crown-900">{formatPrice(s.base_price_cents)}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => { setEditingService(s); setServiceModal(true); }} className="p-1.5 text-crown-500 hover:bg-crown-100 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => handleDeleteService(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Orders */}
                {tab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-bold text-crown-900 mb-4">Orders</h2>
                    {orders.length === 0 ? (
                      <EmptyState title="No orders" description="Orders will appear here." />
                    ) : (
                      <div className="space-y-3">
                        {orders.map((o) => (
                          <div key={o.id} className="card p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-crown-900">{o.order_number}</p>
                                <p className="text-xs text-crown-400">{formatDate(o.created_at)} · {o.shipping_name}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-copper-600">{formatPrice(o.total_cents)}</span>
                                <select
                                  className="input-field text-sm py-1.5 px-2 w-auto"
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                >
                                  {['pending', 'confirmed', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Service Requests */}
                {tab === 'requests' && (
                  <div>
                    <h2 className="text-xl font-bold text-crown-900 mb-4">Service Requests</h2>
                    {requests.length === 0 ? (
                      <EmptyState title="No service requests" description="Requests will appear here." />
                    ) : (
                      <div className="space-y-3">
                        {requests.map((r) => (
                          <div key={r.id} className="card p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div>
                                <p className="font-semibold text-crown-900">{r.service_name}</p>
                                <p className="text-xs text-crown-400">{r.request_number} · {formatDate(r.created_at)}</p>
                                <p className="text-xs text-crown-400 mt-0.5">{r.contact_name} · {r.contact_phone}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {r.urgency === 'emergency' && <Badge variant="danger">Emergency</Badge>}
                                <select
                                  className="input-field text-sm py-1.5 px-2 w-auto"
                                  value={r.status}
                                  onChange={(e) => handleUpdateRequestStatus(r.id, e.target.value)}
                                >
                                  {['submitted', 'under_review', 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((s) => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <p className="text-sm text-crown-500 mb-3">{r.description}</p>
                            <div className="flex items-center gap-2 pt-3 border-t border-crown-100">
                              <Button
                                onClick={() => { setQuoteForRequest(r); setQuoteModal(true); }}
                                size="sm"
                                variant="secondary"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Create Quote
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Quotes */}
                {tab === 'quotes' && (
                  <div>
                    <h2 className="text-xl font-bold text-crown-900 mb-4">Quotes</h2>
                    {quotes.length === 0 ? (
                      <EmptyState title="No quotes" description="Create quotes from service requests." />
                    ) : (
                      <div className="space-y-3">
                        {quotes.map((q) => (
                          <div key={q.id} className="card p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-crown-900">{q.quote_number}</p>
                                <p className="text-xs text-crown-400">{formatDate(q.created_at)}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-copper-600">{formatPrice(q.estimated_cost_cents)}</span>
                                <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                              </div>
                            </div>
                            {q.admin_notes && <p className="text-sm text-crown-500 mt-2">{q.admin_notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {productModal && (
        <ProductEditModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setProductModal(false); setEditingProduct(null); }}
        />
      )}

      {/* Service Modal */}
      {serviceModal && (
        <ServiceEditModal
          service={editingService}
          onSave={handleSaveService}
          onClose={() => { setServiceModal(false); setEditingService(null); }}
        />
      )}

      {/* Quote Modal */}
      {quoteModal && quoteForRequest && (
        <QuoteCreateModal
          request={quoteForRequest}
          onSave={handleCreateQuote}
          onClose={() => { setQuoteModal(false); setQuoteForRequest(null); }}
        />
      )}
    </div>
  );
}

function ProductEditModal({ product, onSave, onClose }: { product: Product | null; onSave: (data: Partial<Product>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    slug: product?.slug || '',
    description: product?.description || '',
    long_description: product?.long_description || '',
    price_cents: product ? String(product.price_cents) : '',
    compare_at_cents: product?.compare_at_cents ? String(product.compare_at_cents) : '',
    stock: product ? String(product.stock) : '0',
    category: product?.category || 'General',
    image_url: product?.image_url || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
  });

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      sku: form.sku,
      slug: form.slug || slugify(form.name),
      description: form.description,
      long_description: form.long_description,
      price_cents: parseInt(form.price_cents) || 0,
      compare_at_cents: form.compare_at_cents ? parseInt(form.compare_at_cents) : null,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      image_url: form.image_url,
      is_featured: form.is_featured,
      is_active: form.is_active,
    });
  };

  return (
    <Modal open={true} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU" value={form.sku} onChange={(e) => update('sku', e.target.value)} required />
          <Input label="Category" value={form.category} onChange={(e) => update('category', e.target.value)} required />
        </div>
        <Textarea label="Short Description" value={form.description} onChange={(e) => update('description', e.target.value)} required rows={2} />
        <Textarea label="Long Description" value={form.long_description} onChange={(e) => update('long_description', e.target.value)} rows={4} />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Price (cents)" type="number" value={form.price_cents} onChange={(e) => update('price_cents', e.target.value)} required />
          <Input label="Compare At (cents)" type="number" value={form.compare_at_cents} onChange={(e) => update('compare_at_cents', e.target.value)} />
          <Input label="Stock" type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} required />
        </div>
        <Input label="Image URL" value={form.image_url} onChange={(e) => update('image_url', e.target.value)} />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-crown-700">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="rounded" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-crown-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="rounded" />
            Active
          </label>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit"><Save className="w-4 h-4" />Save</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function ServiceEditModal({ service, onSave, onClose }: { service: Service | null; onSave: (data: Partial<Service>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: service?.name || '',
    slug: service?.slug || '',
    description: service?.description || '',
    long_description: service?.long_description || '',
    base_price_cents: service ? String(service.base_price_cents) : '',
    category: service?.category || 'General',
    image_url: service?.image_url || '',
    turnaround: service?.turnaround || '',
    is_active: service?.is_active ?? true,
  });

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      long_description: form.long_description,
      base_price_cents: parseInt(form.base_price_cents) || 0,
      category: form.category,
      image_url: form.image_url,
      turnaround: form.turnaround,
      is_active: form.is_active,
    });
  };

  return (
    <Modal open={true} onClose={onClose} title={service ? 'Edit Service' : 'Add Service'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Category" value={form.category} onChange={(e) => update('category', e.target.value)} required />
          <Input label="Base Price (cents)" type="number" value={form.base_price_cents} onChange={(e) => update('base_price_cents', e.target.value)} required />
        </div>
        <Textarea label="Short Description" value={form.description} onChange={(e) => update('description', e.target.value)} required rows={2} />
        <Textarea label="Long Description" value={form.long_description} onChange={(e) => update('long_description', e.target.value)} rows={4} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Turnaround Time" value={form.turnaround} onChange={(e) => update('turnaround', e.target.value)} placeholder="e.g. 1-2 business days" />
          <Input label="Image URL" value={form.image_url} onChange={(e) => update('image_url', e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-crown-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="rounded" />
          Active
        </label>
        <div className="flex gap-3 pt-4">
          <Button type="submit"><Save className="w-4 h-4" />Save</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function QuoteCreateModal({ request, onSave, onClose }: { request: ServiceRequest; onSave: (data: { labor_cents: number; materials_cents: number; admin_notes: string; valid_until: string }) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    labor_cents: '',
    materials_cents: '',
    admin_notes: '',
    valid_until: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const total = (parseInt(form.labor_cents) || 0) + (parseInt(form.materials_cents) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      labor_cents: parseInt(form.labor_cents) || 0,
      materials_cents: parseInt(form.materials_cents) || 0,
      admin_notes: form.admin_notes,
      valid_until: form.valid_until,
    });
  };

  return (
    <Modal open={true} onClose={onClose} title={`Create Quote for ${request.request_number}`} maxWidth="max-w-lg">
      <div className="mb-4 p-3 rounded-lg bg-crown-50 text-sm text-crown-600">
        <p className="font-medium text-crown-900">{request.service_name}</p>
        <p className="text-xs mt-1">{request.description}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Labor (cents)" type="number" value={form.labor_cents} onChange={(e) => update('labor_cents', e.target.value)} required />
          <Input label="Materials (cents)" type="number" value={form.materials_cents} onChange={(e) => update('materials_cents', e.target.value)} required />
        </div>
        <div className="p-3 rounded-lg bg-copper-50 flex items-center justify-between">
          <span className="text-sm font-medium text-crown-700">Total Estimate</span>
          <span className="text-lg font-bold text-copper-600">{formatPrice(total)}</span>
        </div>
        <Textarea label="Admin Notes" value={form.admin_notes} onChange={(e) => update('admin_notes', e.target.value)} rows={3} placeholder="Internal notes about this quote..." />
        <Input label="Valid Until" type="date" value={form.valid_until} onChange={(e) => update('valid_until', e.target.value)} />
        <div className="flex gap-3 pt-4">
          <Button type="submit"><Check className="w-4 h-4" />Send Quote</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
