import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = "507530006213-9ae1s1a9t8pi4lfsqi5r6u8gstaq6qgq.apps.googleusercontent.com";
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) navigate('/resources', { replace: true });
  }, [isAuthenticated, navigate]);

  // Google Login Setup
  useEffect(() => {
    if (!window.google || !buttonRef.current || isAuthenticated) return;
    
    const handleGoogleResponse = async (response) => {
      setIsLoading(true);
      try {
        const res = await axios.post(`${API_URL}/api/auth/google`, { idToken: response.credential });
        login(res.data.data.token);
        toast.success('Signed in with Google!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google login failed');
      } finally {
        setIsLoading(false);
      }
    };

    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
    window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: '100%' });
  }, [login, isAuthenticated]);

  // Local Login Handler
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      login(res.data.data.token);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#1E3A5F]">Smart Campus</h2>
          <p className="mt-2 text-sm text-slate-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLocalLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#1E3A5F] hover:bg-[#153357] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F] transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div>
        </div>

        <div ref={buttonRef} className="w-full" />

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-[#1E3A5F] hover:text-blue-600">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
