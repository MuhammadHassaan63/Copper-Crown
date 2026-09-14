import { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/context/RouterContext';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export function SignInPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
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
          <h1 className="text-2xl font-bold text-crown-900 text-center">Welcome Back</h1>
          <p className="mt-1 text-sm text-crown-400 text-center">Sign in to your account</p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-crown-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-copper-600 hover:text-copper-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
