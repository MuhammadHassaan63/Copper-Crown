import { useEffect, useState } from 'react';
import { ArrowRight, Check, AlertCircle, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from '@/context/RouterContext';
import { generateRequestNumber } from '@/lib/format';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

const SERVICE_TYPES = [
  'Electrical Installation',
  'Electrical Repair',
  'Fan Installation/Repair',
  'Wiring Work',
  'Switch/Socket Work',
  'Lighting Installation/Repair',
  'Electrical Inspection',
  'Other',
];

export function ServiceRequestPage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [services, setServices] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    service_type: '',
    description: '',
    address: '',
    city: '',
    preferred_date: '',
    preferred_time: '',
    urgency: 'normal' as 'emergency' | 'urgent' | 'normal' | 'flexible',
    contact_name: profile?.full_name || '',
    contact_phone: profile?.phone || '',
    contact_email: user?.email || '',
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('services')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      setServices((data as { id: string; name: string; slug: string }[]) || []);
      setLoading(false);

      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const svcSlug = params.get('service');
      if (svcSlug) {
        const svc = (data as { id: string; name: string; slug: string }[])?.find((s) => s.slug === svcSlug);
        if (svc) {
          setForm((f) => ({ ...f, service_type: svc.name }));
        }
      }
    })();
  }, [user, profile]);

  const updateForm = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }

    setSubmitting(true);
    setError(null);

    const requestNumber = generateRequestNumber();
    const selectedService = services.find((s) => s.name === form.service_type);

    try {
      let imageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${requestNumber}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(`${user.id}/${fileName}`, imageFile);
        if (uploadError) {
          // Storage bucket might not exist yet — continue without image
          imageUrl = '';
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('service-images')
            .getPublicUrl(`${user.id}/${fileName}`);
          imageUrl = publicUrl;
        }
      }

      const { error: insertError } = await supabase.from('service_requests').insert({
        user_id: user.id,
        service_id: selectedService?.id || null,
        service_name: form.service_type || 'Other',
        request_number: requestNumber,
        status: 'submitted',
        description: form.description + (imageUrl ? `\n\n[Image attached: ${imageUrl}]` : ''),
        address: form.address,
        city: form.city,
        state: '',
        zip: '',
        preferred_date: form.preferred_date || null,
        urgency: form.urgency,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
      });

      if (insertError) throw insertError;

      setReferenceNumber(requestNumber);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user && !loading) {
    return (
      <div className="container-max px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold text-crown-900">Sign in to request service</h2>
          <p className="mt-2 text-crown-500">
            You need an account to submit a service request so we can track your request and send you a quote.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signin" className="btn-primary">Sign In</Link>
            <Link to="/signup" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container-max px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-crown-900">Service Request Submitted!</h2>
          <p className="mt-2 text-crown-500">
            Your reference number is{' '}
            <span className="font-bold text-copper-600">{referenceNumber}</span>.
            Keep this number to track your request. Our team will review it and
            contact you shortly.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/account" className="btn-primary">
              View My Requests
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/services" className="btn-secondary">Browse Services</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-950 text-white py-12">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold">Request a Service</h1>
          <p className="mt-2 text-crown-400">
            Need electrical work or have a problem to report? Tell us what you need.
          </p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card p-6 lg:p-8 space-y-5">
            <div>
              <label className="label-field">Service Type</label>
              <select
                className="input-field"
                value={form.service_type}
                onChange={(e) => updateForm('service_type', e.target.value)}
                required
              >
                <option value="">Select what you need</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <Textarea
              label="Problem / Work Description"
              placeholder="Describe the electrical problem or the work you want done. Be as specific as possible."
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              required
              rows={5}
            />

            {/* Image Upload */}
            <div>
              <label className="label-field">Optional: Upload an Image of the Problem</label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-crown-200" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-crown-200 rounded-lg cursor-pointer hover:border-copper-400 transition-colors">
                  <div className="flex flex-col items-center gap-2 text-crown-400">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Click to upload (max 5MB)</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Address / Location"
                placeholder="Where is the work needed?"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
              />
              <Input
                label="City"
                placeholder="City"
                value={form.city}
                onChange={(e) => updateForm('city', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Preferred Date"
                type="date"
                value={form.preferred_date}
                onChange={(e) => updateForm('preferred_date', e.target.value)}
              />
              <Input
                label="Preferred Time"
                type="time"
                value={form.preferred_time}
                onChange={(e) => updateForm('preferred_time', e.target.value)}
              />
            </div>

            <Select
              label="Urgency"
              value={form.urgency}
              onChange={(e) => updateForm('urgency', e.target.value as 'emergency' | 'urgent' | 'normal' | 'flexible')}
            >
              <option value="emergency">Emergency</option>
              <option value="urgent">Urgent (1-2 days)</option>
              <option value="normal">Normal (within a week)</option>
              <option value="flexible">Flexible (no rush)</option>
            </Select>

            <div className="pt-4 border-t border-crown-100">
              <h3 className="font-semibold text-crown-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={form.contact_name}
                  onChange={(e) => updateForm('contact_name', e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={form.contact_phone}
                  onChange={(e) => updateForm('contact_phone', e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => updateForm('contact_email', e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} size="lg" fullWidth>
              {submitting ? 'Submitting...' : (
                <>
                  Submit Request
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
