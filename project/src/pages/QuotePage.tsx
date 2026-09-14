import { useState } from 'react';
import { ArrowRight, Check, AlertCircle, FileText, ShoppingBag, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/context/RouterContext';
import { generateQuoteRequestNumber } from '@/lib/format';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export function QuotePage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    request_type: 'products' as 'products' | 'service' | 'both',
    product_categories: '',
    service_type: '',
    description: '',
    quantity: '1',
    budget_range: '',
    contact_name: profile?.full_name || '',
    contact_phone: profile?.phone || '',
    contact_email: user?.email || '',
    address: '',
    preferred_date: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const quoteNumber = generateQuoteRequestNumber();

    try {
      const { error: insertError } = await supabase.from('quote_requests').insert({
        user_id: user?.id || null,
        quote_number: quoteNumber,
        status: 'submitted',
        request_type: form.request_type,
        product_categories: form.product_categories,
        service_type: form.service_type,
        description: form.description,
        quantity: parseInt(form.quantity) || 1,
        budget_range: form.budget_range,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        address: form.address,
        preferred_date: form.preferred_date || null,
      });

      if (insertError) throw insertError;

      setReferenceNumber(quoteNumber);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quote request');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container-max px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-crown-900">Quote Request Submitted!</h2>
          <p className="mt-2 text-crown-500">
            Your reference number is{' '}
            <span className="font-bold text-copper-600">{referenceNumber}</span>.
            Keep this number to track your quote. Our team will review your requirements
            and respond with a detailed estimate.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {user && (
              <Link to="/account" className="btn-primary">
                View My Requests
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link to="/products" className="btn-secondary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-950 text-white py-12">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold">Get a Quote</h1>
          <p className="mt-2 text-crown-400">
            Tell us what products or electrical work you need — we'll provide a detailed estimate.
          </p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {!user && (
            <div className="mb-6 p-4 rounded-lg bg-copper-50 border border-copper-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-copper-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-copper-800">
                  You can submit a quote without an account, but{' '}
                  <Link to="/signin" className="font-semibold underline">signing in</Link>
                  {' '}lets you track your quote status and manage all requests in one place.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card p-6 lg:p-8 space-y-5">
            {/* Request Type */}
            <div>
              <label className="label-field">What do you need?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'products', label: 'Products', icon: ShoppingBag },
                  { value: 'service', label: 'Service', icon: Wrench },
                  { value: 'both', label: 'Both', icon: FileText },
                ].map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('request_type', opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                        form.request_type === opt.value
                          ? 'border-copper-500 bg-copper-50 text-copper-700'
                          : 'border-crown-200 text-crown-500 hover:border-crown-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {(form.request_type === 'products' || form.request_type === 'both') && (
              <Input
                label="Product Categories Needed"
                placeholder="e.g. 2 ceiling fans, 100m copper wiring, 10 LED bulbs"
                value={form.product_categories}
                onChange={(e) => update('product_categories', e.target.value)}
              />
            )}

            {(form.request_type === 'service' || form.request_type === 'both') && (
              <Select
                label="Service Type"
                value={form.service_type}
                onChange={(e) => update('service_type', e.target.value)}
              >
                <option value="">Select a service type</option>
                <option value="Electrical Installation">Electrical Installation</option>
                <option value="Electrical Repair">Electrical Repair</option>
                <option value="Fan Installation/Repair">Fan Installation/Repair</option>
                <option value="Wiring Work">Wiring Work</option>
                <option value="Switch/Socket Work">Switch/Socket Work</option>
                <option value="Lighting Installation/Repair">Lighting Installation/Repair</option>
                <option value="Electrical Inspection">Electrical Inspection</option>
                <option value="Other">Other</option>
              </Select>
            )}

            <Textarea
              label="Description"
              placeholder="Describe what products or electrical work you need. Include details like quantity, specifications, scope of work, or the problem you're experiencing."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
              rows={5}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Approximate Quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                min="1"
              />
              <Input
                label="Budget Range (Optional)"
                placeholder="e.g. PKR 10,000 - 20,000"
                value={form.budget_range}
                onChange={(e) => update('budget_range', e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-crown-100">
              <h3 className="font-semibold text-crown-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={form.contact_name}
                  onChange={(e) => update('contact_name', e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={form.contact_phone}
                  onChange={(e) => update('contact_phone', e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => update('contact_email', e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Address / Location (Optional)"
                  placeholder="Where is the work or delivery needed?"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Preferred Date (Optional)"
                  type="date"
                  value={form.preferred_date}
                  onChange={(e) => update('preferred_date', e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} size="lg" fullWidth>
              {submitting ? 'Submitting...' : (
                <>
                  Submit Quote Request
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
