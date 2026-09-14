import { Phone, Mail, Clock, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/context/RouterContext';

export function Footer() {
  return (
    <footer className="bg-crown-900 text-crown-300 mt-auto">
      <div className="container-max px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="mb-4">
              <Logo size={36} light />
            </div>
            <p className="text-sm text-crown-400 leading-relaxed">
              The Royal Standard of Electrical Craftsmanship. Quality electrical
              supplies and professional services for homes and businesses.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-crown-400">
                <ShieldCheck className="w-4 h-4 text-copper-400" />
                Quality Assured
              </div>
              <div className="flex items-center gap-1.5 text-xs text-crown-400">
                <Zap className="w-4 h-4 text-copper-400" />
                Expert Service
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="hover:text-copper-400 transition-colors">All Products</Link></li>
              <li><Link to="/products" className="hover:text-copper-400 transition-colors">Fans</Link></li>
              <li><Link to="/products" className="hover:text-copper-400 transition-colors">Wiring &amp; Cables</Link></li>
              <li><Link to="/products" className="hover:text-copper-400 transition-colors">Switches &amp; Sockets</Link></li>
              <li><Link to="/products" className="hover:text-copper-400 transition-colors">Lighting</Link></li>
              <li><Link to="/products" className="hover:text-copper-400 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services" className="hover:text-copper-400 transition-colors">Services</Link></li>
              <li><Link to="/service-request" className="hover:text-copper-400 transition-colors">Request a Service</Link></li>
              <li><Link to="/quote" className="hover:text-copper-400 transition-colors">Get a Quote</Link></li>
              <li><Link to="/about" className="hover:text-copper-400 transition-colors">About Us</Link></li>
              <li><Link to="/track-order" className="hover:text-copper-400 transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-copper-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-copper-400 mt-0.5 flex-shrink-0" />
                <a href="tel:03294942684" className="hover:text-copper-400 transition-colors">0329-4942684</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-copper-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:coppercrown.pk@gmail.com" className="hover:text-copper-400 transition-colors break-all">coppercrown.pk@gmail.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-copper-400 mt-0.5 flex-shrink-0" />
                <span>Mon-Sat: 9AM - 7PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-crown-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-crown-400">
            &copy; {new Date().getFullYear()} Copper &amp; Crown. The Royal Standard of Electrical Craftsmanship.
          </p>
          <div className="flex items-center gap-4 text-xs text-crown-400">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-copper-400" />
              Secure Payments Ready
            </span>
            <Link to="/account" className="hover:text-copper-400 transition-colors">My Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
