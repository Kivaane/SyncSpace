import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuthStore } from '../store';
import { Loader2, Command } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10"></div>
      
      <div className="w-full max-w-md space-y-8 p-10 bg-slate-900/50 backdrop-blur border border-white/10 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <Command className="text-white h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm">Get started with SyncSpace</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              required
              className="mt-2 w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              required
              className="mt-2 w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              required
              className="mt-2 w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
