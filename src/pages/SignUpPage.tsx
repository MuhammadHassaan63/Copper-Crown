import { useState } from 'react';
import { ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/context/RouterContext';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export function SignUpPage() {
  const { signUp } = useAuth();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(form.email, form.password, form.fullName, form.phone);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/account');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-crown-50">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex justify-center mb-6">
            <Logo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-crown-900 text-center">Create Account</h1>
          <p className="mt-1 text-sm text-crown-400 text-center">Join Copper &amp; Crown today</p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Full Name"
              placeholder="John Smith"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={(e) => update('confirm', e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? 'Creating account...' : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-1.5">
            <p className="flex items-center gap-2 text-xs text-crown-400">
              <Check className="w-3.5 h-3.5 text-green-500" />
              Track orders and service requests
            </p>
            <p className="flex items-center gap-2 text-xs text-crown-400">
              <Check className="w-3.5 h-3.5 text-green-500" />
              Faster checkout with saved info
            </p>
            <p className="flex items-center gap-2 text-xs text-crown-400">
              <Check className="w-3.5 h-3.5 text-green-500" />
              Receive quotes and estimates
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-crown-400">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-copper-600 hover:text-copper-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
