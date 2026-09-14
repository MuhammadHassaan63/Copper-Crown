import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/ui/Loading';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { ServiceRequestPage } from '@/pages/ServiceRequestPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { AccountPage } from '@/pages/AccountPage';
import { AdminPage } from '@/pages/AdminPage';
import { ContactPage } from '@/pages/ContactPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { AboutPage } from '@/pages/AboutPage';
import { QuotePage } from '@/pages/QuotePage';

function Routes() {
  const { path } = useRouter();
  const cleanPath = path.split('?')[0];

  if (cleanPath === '/' || cleanPath === '') return <HomePage />;
  if (cleanPath === '/products') return <ProductsPage />;
  if (cleanPath.startsWith('/products/')) {
    const slug = cleanPath.replace('/products/', '');
    return <ProductDetailPage slug={slug} />;
  }
  if (cleanPath === '/services') return <ServicesPage />;
  if (cleanPath.startsWith('/services/')) {
    const slug = cleanPath.replace('/services/', '');
    return <ServiceDetailPage slug={slug} />;
  }
  if (cleanPath === '/service-request') return <ServiceRequestPage />;
  if (cleanPath === '/cart') return <CartPage />;
  if (cleanPath === '/checkout') return <CheckoutPage />;
  if (cleanPath === '/signin') return <SignInPage />;
  if (cleanPath === '/signup') return <SignUpPage />;
  if (cleanPath === '/account') return <AccountPage />;
  if (cleanPath === '/admin') return <AdminPage />;
  if (cleanPath === '/about') return <AboutPage />;
  if (cleanPath === '/quote') return <QuotePage />;
  if (cleanPath === '/contact') return <ContactPage />;
  if (cleanPath === '/track-order') return <TrackOrderPage />;

  return (
    <div className="container-max px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-crown-900 mb-4">404</h1>
      <p className="text-crown-400">Page not found.</p>
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) return <FullPageLoader />;

  return (
    <div className="min-h-screen flex flex-col bg-crown-50">
      <Navbar />
      <main className="flex-1">
        <Routes />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
