import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, Lock, Mail, AlertCircle, ArrowLeft, Fish } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-2">
          <Link to="/" className="inline-flex items-center gap-2 text-ocean-900 font-extrabold text-2xl tracking-tight">
            <span className="w-10 h-10 rounded-[5px] bg-ocean-900 text-white flex items-center justify-center font-black shadow-card">
              V²
            </span>
            <span>SEAFOOD</span>
          </Link>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Or{' '}
          <Link to="/" className="font-semibold text-ocean-700 hover:text-ocean-900">
            return to store
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-card rounded-[5px] sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-5 rounded-[5px] bg-red-50 p-3.5 border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-[5px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vsquareseafood.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-700 focus:border-ocean-700 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-[5px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-700 focus:border-ocean-700 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-[5px] shadow-sm text-sm font-bold text-white bg-ocean-900 hover:bg-ocean-800 focus:outline-none transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Default Super Admin: <span className="font-mono text-slate-600">admin@vsquareseafood.com</span> / <span className="font-mono text-slate-600">AdminPassword123!</span> (after seeding)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

