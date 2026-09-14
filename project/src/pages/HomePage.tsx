import { useEffect, useState } from 'react';
import {
  ArrowRight, Clock, CheckCircle2, Zap, ShieldCheck, Wrench, Phone,
  Star, ShoppingBag, FileText, Award, Truck, Headphones,
} from 'lucide-react';
import { Link } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { ProductCard } from '@/components/ProductCard';
import { Badge } from '@/components/ui/Badge';
import type { Product, Service, Review } from '@/types/database';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: products }, { data: servicesData }, { data: reviewsData }] = await Promise.all([
        supabase.from('products').select('*').eq('is_featured', true).eq('is_active', true).limit(4),
        supabase.from('services').select('*').eq('is_active', true).order('name').limit(6),
        supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(3),
      ]);
      setFeaturedProducts((products as Product[]) || []);
      setServices((servicesData as Service[]) || []);
      setReviews((reviewsData as Review[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-crown-950">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4981793/pexels-photo-4981793.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Electrical work"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-crown-950 via-crown-950/90 to-crown-800/60" />
        </div>

        <div className="relative container-max px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-copper-500/15 border border-copper-500/30 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 text-copper-400" fill="currentColor" />
              <span className="text-sm font-medium text-copper-200">The Royal Standard of Electrical Craftsmanship</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Quality Electrical Supplies <br />
              <span className="text-gradient-copper">&amp; Professional Service</span>
            </h1>
            <p className="mt-6 text-lg text-crown-300 leading-relaxed max-w-xl">
              Shop premium fans, wiring, switches, lighting, and accessories — or
              request expert electrical services. Copper &amp; Crown delivers
              craftsmanship you can trust.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
              <Link to="/products" className="btn-primary text-sm sm:text-base px-5 py-3.5">
                <ShoppingBag className="w-5 h-5" />
                Shop Products
              </Link>
              <Link to="/service-request" className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-semibold text-white border border-crown-600 hover:border-copper-400 hover:text-copper-300 transition-all duration-200 text-sm sm:text-base">
                <Wrench className="w-5 h-5" />
                Request a Service
              </Link>
              <Link to="/quote" className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-semibold text-white border border-crown-600 hover:border-copper-400 hover:text-copper-300 transition-all duration-200 text-sm sm:text-base">
                <FileText className="w-5 h-5" />
                Get a Quote
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-semibold text-white border border-crown-600 hover:border-copper-400 hover:text-copper-300 transition-all duration-200 text-sm sm:text-base">
                <Phone className="w-5 h-5" />
                Contact Us
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-crown-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-copper-400" />
                Quality Assured
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-copper-400" />
                Genuine Products
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-copper-400" />
                0329-4942684
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-crown-100">
        <div className="container-max px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: 'Quality Assured', sub: 'Genuine Products Only' },
              { icon: Truck, label: 'Fast Delivery', sub: 'Across the Region' },
              { icon: Award, label: 'Expert Craftsmanship', sub: 'Skilled Electricians' },
              { icon: Headphones, label: 'Customer Support', sub: '0329-4942684' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-copper-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-copper-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-crown-900">{item.label}</p>
                    <p className="text-xs text-crown-400">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div className="container-max">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-copper-600 uppercase tracking-wider mb-1">
                Featured Products
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-crown-900">
                Top Picks for Your Project
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-copper-600 hover:text-copper-700 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse bg-crown-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="sm:hidden mt-6">
            <Link to="/products" className="btn-secondary w-full">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="bg-crown-100/50 section-padding">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-semibold text-copper-600 uppercase tracking-wider mb-1">
              Our Services
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-crown-900">
              Professional Electrical Services
            </h2>
            <p className="mt-3 text-crown-500">
              From installations to repairs, our experienced electricians deliver
              quality workmanship on every job.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card aspect-[4/3] animate-pulse bg-crown-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.slug}`}
                  className="card card-hover group overflow-hidden flex flex-col"
                >
                  <div className="aspect-[3/2] overflow-hidden bg-crown-50">
                    {service.image_url && (
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <Badge variant="copper" className="self-start mb-2">{service.category}</Badge>
                    <h3 className="font-semibold text-crown-900 group-hover:text-copper-600 transition-colors leading-snug">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-sm text-crown-400 line-clamp-2 flex-1">
                      {service.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-crown-400">From</span>
                        <p className="text-lg font-bold text-crown-900">
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
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/service-request" className="btn-primary">
              <Wrench className="w-4 h-4" />
              Request a Service
            </Link>
            <Link to="/services" className="btn-secondary">
              View All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-semibold text-copper-600 uppercase tracking-wider mb-1">
              Why Choose Copper &amp; Crown
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-crown-900">
              The Royal Standard Difference
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Quality You Can Trust', desc: 'We stock only genuine, tested electrical products from reputable brands. No compromises on safety or reliability.' },
              { icon: Wrench, title: 'Expert Electrical Services', desc: 'Our skilled electricians handle installations, repairs, wiring, and inspections with professional craftsmanship.' },
              { icon: ShoppingBag, title: 'Everything in One Place', desc: 'From fans and wiring to switches, lighting, and accessories — find all your electrical supplies under one roof.' },
              { icon: Truck, title: 'Fast & Reliable Delivery', desc: 'Get your products delivered quickly. We offer standard and express delivery options to meet your needs.' },
              { icon: FileText, title: 'Transparent Quoting', desc: 'Need a quote for products or services? Submit your requirements and receive a detailed, no-obligation estimate.' },
              { icon: Phone, title: 'Dedicated Support', desc: 'Have questions? Our team is here to help. Call us at 0329-4942684 or reach out through our contact page.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-copper-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-copper-600" />
                  </div>
                  <h3 className="font-semibold text-crown-900 text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-crown-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <section className="bg-crown-900 section-padding">
          <div className="container-max">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-sm font-semibold text-copper-400 uppercase tracking-wider mb-1">
                Customer Reviews
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                What Our Customers Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-crown-800 rounded-xl p-6 border border-crown-700">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-copper-400' : 'text-crown-600'}`}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  {review.title && <h4 className="font-semibold text-white mb-2">{review.title}</h4>}
                  <p className="text-sm text-crown-300 leading-relaxed">"{review.comment}"</p>
                  <p className="mt-4 text-xs text-crown-400">— {review.user_name || 'Customer'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-copper-600 section-padding">
        <div className="container-max text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Need a Custom Quote?
          </h2>
          <p className="mt-3 text-copper-100 max-w-xl mx-auto">
            Tell us about your project — whether you need products, electrical work, or both.
            Our team will provide a detailed estimate.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/quote"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-copper-700 bg-white hover:bg-copper-50 transition-all duration-200 shadow-md"
            >
              <FileText className="w-5 h-5" />
              Get a Quote
            </Link>
            <a
              href="tel:03294942684"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-white border border-copper-300 hover:bg-copper-700 transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              Call 0329-4942684
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
