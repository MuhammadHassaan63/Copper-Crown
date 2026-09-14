import { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, Package, Wrench, Home as HomeIcon, Phone, FileText, Info, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Link, useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { path, navigate } = useRouter();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [path]);

  const navItems = [
    { label: 'Home', to: '/', icon: HomeIcon },
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Services', to: '/services', icon: Wrench },
    { label: 'Get a Quote', to: '/quote', icon: FileText },
    { label: 'About', to: '/about', icon: Info },
    { label: 'Contact', to: '/contact', icon: Phone },
  ];

  const isActive = (to: string) => {
    if (to === '/') return path === '/';
    return path.startsWith(to);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-crown-100'
            : 'bg-white border-b border-crown-100'
        }`}
      >
        <nav className="container-max px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex-shrink-0">
              <Logo size={36} />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.to)
                        ? 'text-copper-600 bg-copper-50'
                        : 'text-crown-700 hover:bg-crown-100 hover:text-copper-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative p-2.5 rounded-lg text-crown-700 hover:bg-crown-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-copper-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-crown-700 hover:bg-crown-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center text-white text-xs font-bold">
                      {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">
                      {profile?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-crown-100 py-2 z-20 animate-scale-in">
                        <div className="px-4 py-2 border-b border-crown-100">
                          <p className="text-sm font-semibold text-crown-900 truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-crown-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-crown-700 hover:bg-crown-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Account
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-copper-600 hover:bg-copper-50 transition-colors font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                            navigate('/');
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-crown-700 hover:bg-crown-50 transition-colors border-t border-crown-100 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/signin" className="hidden sm:flex btn-ghost text-sm">
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-lg text-crown-700 hover:bg-crown-100 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-crown-100 animate-slide-up">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'text-copper-600 bg-copper-50'
                        : 'text-crown-700 hover:bg-crown-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-crown-100 pt-2 mt-2">
                {user ? (
                  <>
                    <Link
                      to="/account"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-crown-700 hover:bg-crown-100 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-copper-600 hover:bg-copper-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        navigate('/');
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-crown-700 hover:bg-crown-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-crown-700 hover:bg-crown-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <div className="h-16 lg:h-20" />
    </>
  );
}
