import { useEffect, useState, useMemo } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { Link } from '@/context/RouterContext';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { Wrench } from 'lucide-react';
import type { Service } from '@/types/database';

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category');
      setServices((data as Service[]) || []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    return ['all', ...Array.from(cats).sort()];
  }, [services]);

  const filtered = useMemo(() => {
    if (category === 'all') return services;
    return services.filter((s) => s.category === category);
  }, [services, category]);

  if (loading) {
    return (
      <div className="container-max px-4 py-20 flex justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-900 text-white py-12">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold">Electrical Services</h1>
          <p className="mt-2 text-crown-400">
            Professional installation, repair, and maintenance by licensed electricians.
          </p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-copper-500 text-white'
                  : 'bg-white text-crown-600 border border-crown-200 hover:border-copper-300'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-12 h-12" />}
            title="No services found"
            description="Check back soon — we're adding new services regularly."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="card card-hover group overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden bg-crown-50 relative">
                  {service.image_url && (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="copper">{service.category}</Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-crown-900 group-hover:text-copper-600 transition-colors leading-snug">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-crown-400 line-clamp-3 flex-1">
                    {service.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-crown-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-crown-400">From</span>
                      <p className="text-lg font-bold text-copper-600">
                        {formatPrice(service.base_price_cents)}
                      </p>
                    </div>
                    {service.turnaround && (
                      <div className="flex items-center gap-1 text-xs text-crown-400">
                        <Clock className="w-3.5 h-3.5" />
                        {service.turnaround}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-copper-600">
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 card p-8 bg-gradient-to-br from-crown-900 to-crown-800 text-white text-center">
          <h2 className="text-xl font-bold">Don't see what you need?</h2>
          <p className="mt-2 text-crown-400">
            We handle all types of electrical work. Request a custom quote for your project.
          </p>
          <Link to="/service-request" className="btn-primary mt-4">
            Request a Custom Quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
