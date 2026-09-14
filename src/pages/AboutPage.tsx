import { Zap, ShieldCheck, Wrench, ShoppingBag, FileText, Phone, Mail, Award, Truck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/context/RouterContext';

export function AboutPage() {
  return (
    <div className="animate-fade-in">
      <div className="bg-crown-950 text-white py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8 text-center">
          <Logo size={56} light className="justify-center mb-4" />
          <h1 className="text-3xl lg:text-5xl font-bold mt-4">About Copper &amp; Crown</h1>
          <p className="mt-3 text-copper-400 text-sm uppercase tracking-widest">
            The Royal Standard of Electrical Craftsmanship
          </p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Story */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-crown-900 mb-4">Our Story</h2>
          <p className="text-crown-600 leading-relaxed text-lg">
            Copper &amp; Crown is an electrical supplies and electrical services business
            dedicated to delivering quality products and professional craftsmanship.
            We believe that every electrical project — big or small — deserves the
            royal standard of attention, care, and expertise.
          </p>
          <p className="text-crown-600 leading-relaxed mt-4">
            From fans and wiring to switches, sockets, lighting, and accessories, we
            supply the products that power homes and businesses. And when you need
            professional electrical work, our team is ready to help with installations,
            repairs, inspections, and more.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: ShieldCheck, title: 'Quality First', desc: 'We source and supply only genuine, reliable electrical products. Safety and performance are never compromised.' },
            { icon: Wrench, title: 'Skilled Craftsmanship', desc: 'Our electricians bring professional expertise to every job — from simple repairs to complete wiring installations.' },
            { icon: Award, title: 'Customer Commitment', desc: 'We treat every customer with respect and every project with care. Your satisfaction is our priority from start to finish.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-copper-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-copper-600" />
                </div>
                <h3 className="font-semibold text-crown-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-crown-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* What We Do */}
        <div className="card p-8 lg:p-12 mb-16">
          <h2 className="text-2xl font-bold text-crown-900 mb-6 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-copper-50 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-copper-600" />
                </div>
                <h3 className="font-semibold text-crown-900 text-lg">Electrical Supplies</h3>
              </div>
              <p className="text-sm text-crown-500 leading-relaxed">
                We offer a wide range of electrical products including ceiling fans,
                exhaust fans, pedestal fans, copper wiring and cables, switches, sockets,
                LED lighting, panel lights, circuit breakers, conduit pipes, junction boxes,
                multimeters, and other electrical accessories.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-copper-50 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-copper-600" />
                </div>
                <h3 className="font-semibold text-crown-900 text-lg">Electrical Services</h3>
              </div>
              <p className="text-sm text-crown-500 leading-relaxed">
                Our services include electrical installation, repair, fan installation and
                repair, wiring work, switch and socket installation, lighting installation
                and repair, electrical inspection, and custom electrical projects tailored
                to your specific needs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-crown-900 rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
          <p className="text-crown-400 mb-6 max-w-lg mx-auto">
            Whether you need quality electrical products or professional service, Copper &amp; Crown is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary">
              <ShoppingBag className="w-4 h-4" />
              Shop Products
            </Link>
            <Link to="/service-request" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white border border-crown-600 hover:border-copper-400 transition-all">
              <Wrench className="w-4 h-4" />
              Request a Service
            </Link>
            <Link to="/quote" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white border border-crown-600 hover:border-copper-400 transition-all">
              <FileText className="w-4 h-4" />
              Get a Quote
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-crown-800 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <a href="tel:03294942684" className="flex items-center gap-2 text-crown-300 hover:text-copper-400 transition-colors">
              <Phone className="w-4 h-4 text-copper-400" />
              0329-4942684
            </a>
            <a href="mailto:coppercrown.pk@gmail.com" className="flex items-center gap-2 text-crown-300 hover:text-copper-400 transition-colors">
              <Mail className="w-4 h-4 text-copper-400" />
              coppercrown.pk@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
