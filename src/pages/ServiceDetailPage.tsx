import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Check, Wrench, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { Link, useRouter } from '@/context/RouterContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import type { Service } from '@/types/database';

export function ServiceDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      setService(data as Service | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-max px-4 py-20 flex justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container-max px-4 py-20">
        <EmptyState
          title="Service not found"
          description="The service you're looking for may be unavailable."
          action={<Link to="/services" className="btn-primary">Browse Services</Link>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-1.5 text-sm text-crown-500 hover:text-copper-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card overflow-hidden mb-6">
              {service.image_url && (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full aspect-[16/9] object-cover"
                />
              )}
            </div>

            <Badge variant="copper" className="mb-3">{service.category}</Badge>
            <h1 className="text-2xl lg:text-3xl font-bold text-crown-900">{service.name}</h1>
            <p className="mt-3 text-crown-600 leading-relaxed">{service.description}</p>

            {service.long_description && (
              <div className="mt-6 prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-crown-900 mb-2">Details</h3>
                <p className="text-crown-600 leading-relaxed">{service.long_description}</p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-4">
                <Clock className="w-5 h-5 text-copper-500 mb-2" />
                <p className="text-xs text-crown-400">Turnaround</p>
                <p className="text-sm font-semibold text-crown-900">{service.turnaround || 'Varies'}</p>
              </div>
              <div className="card p-4">
                <Check className="w-5 h-5 text-copper-500 mb-2" />
                <p className="text-xs text-crown-400">Warranty</p>
                <p className="text-sm font-semibold text-crown-900">5-Year Workmanship</p>
              </div>
              <div className="card p-4">
                <Wrench className="w-5 h-5 text-copper-500 mb-2" />
                <p className="text-xs text-crown-400">Starting at</p>
                <p className="text-sm font-semibold text-crown-900">{formatPrice(service.base_price_cents)}</p>
              </div>
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-crown-900 text-lg">Request This Service</h3>
              <p className="mt-2 text-sm text-crown-400">
                Get a free, no-obligation quote. Our team responds within 24 hours.
              </p>
              <div className="mt-4 p-4 bg-copper-50 rounded-lg">
                <p className="text-xs text-crown-400">Starting from</p>
                <p className="text-2xl font-bold text-copper-600">
                  {formatPrice(service.base_price_cents)}
                </p>
                <p className="text-xs text-crown-400 mt-1">Final price varies by scope</p>
              </div>
              <Link to={`/service-request?service=${service.slug}`} className="btn-primary w-full mt-4">
                Request a Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:5551234567"
                className="btn-secondary w-full mt-3"
              >
                Call (555) 123-4567
              </a>
              <div className="mt-4 pt-4 border-t border-crown-100 space-y-2 text-xs text-crown-400">
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  Free consultation
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  Licensed & insured
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  No obligation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
