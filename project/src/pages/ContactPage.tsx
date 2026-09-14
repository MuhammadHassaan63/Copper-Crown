import { useState } from 'react';
import { Phone, Mail, Clock, Send, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Input, Textarea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from('contact_messages').insert({
        user_id: user?.id || null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      });
      if (dbError) throw dbError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-950 text-white py-12">
        <div className="container-max px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">Get in Touch</h1>
          <p className="mt-2 text-copper-400 text-sm uppercase tracking-widest">The Royal Standard of Electrical Craftsmanship</p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <a href="tel:03294942684" className="card p-6 flex items-center gap-4 hover:border-copper-300 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-copper-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-copper-600" />
            </div>
            <div>
              <p className="text-xs text-crown-400 uppercase tracking-wider">Call Us</p>
              <p className="text-lg font-bold text-crown-900 group-hover:text-copper-600 transition-colors">0329-4942684</p>
            </div>
          </a>
          <a href="mailto:coppercrown.pk@gmail.com" className="card p-6 flex items-center gap-4 hover:border-copper-300 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-copper-50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-copper-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-crown-400 uppercase tracking-wider">Email Us</p>
              <p className="text-lg font-bold text-crown-900 group-hover:text-copper-600 transition-colors truncate">coppercrown.pk@gmail.com</p>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold text-crown-900 mb-4">Business Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-copper-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-copper-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-crown-900">Phone</p>
                    <p className="text-sm text-crown-500">0329-4942684</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-copper-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-copper-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-crown-900">Email</p>
                    <p className="text-sm text-crown-500 break-all">coppercrown.pk@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-copper-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-copper-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-crown-900">Business Hours</p>
                    <p className="text-sm text-crown-500">Monday - Saturday: 9AM - 7PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-copper-50 to-crown-50">
              <h3 className="font-bold text-crown-900">Copper &amp; Crown</h3>
              <p className="mt-1 text-sm text-copper-600 font-medium">The Royal Standard of Electrical Craftsmanship</p>
              <p className="mt-3 text-sm text-crown-600">
                Quality electrical supplies and professional services. Questions about
                products, services, or your order? We're here to help.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="card p-6 lg:p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-crown-900">Message Sent!</h3>
                <p className="mt-2 text-sm text-crown-500">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  variant="secondary"
                  className="mt-4"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-crown-900 text-lg mb-4">Send Us a Message</h3>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                    <Input label="Phone" type="tel" placeholder="03XX-XXXXXXX" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                  </div>
                  <Input label="Subject" placeholder="What is this about?" value={form.subject} onChange={(e) => update('subject', e.target.value)} />
                  <Textarea
                    label="Message"
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    required
                    rows={5}
                  />
                  <Button type="submit" disabled={submitting} size="lg" fullWidth>
                    {submitting ? 'Sending...' : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
