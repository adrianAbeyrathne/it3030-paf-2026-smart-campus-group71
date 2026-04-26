import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in → go to resources
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/resources', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Initialise Google Identity Services button
  useEffect(() => {
    if (!window.google || !buttonRef.current || isAuthenticated) return;

    const handleCredentialResponse = async (response) => {
      setIsLoading(true);
      setError('');
      try {
        const res = await axios.post(`${API_URL}/api/auth/google`, {
          idToken: response.credential
        });
        const authData = res.data?.data;
        if (authData?.token) {
          login(authData.token);
          toast.success(`Welcome, ${authData.name || 'User'}!`);
          navigate('/resources', { replace: true });
        } else {
          setError('Authentication failed – no token received.');
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Google sign-in failed. Please try again.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'signin_with',
      shape: 'rectangular'
    });
  }, [login, navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F2847] via-[#1E3A5F] to-[#153357]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header stripe */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2563EB] px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Smart Campus</h1>
            <p className="mt-1 text-sm text-blue-100">Operations Hub · SLIIT</p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 text-center">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Sign in to continue</h2>
            <p className="text-sm text-slate-500 mb-8">
              Use your SLIIT Google account to access the platform
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
                <svg className="animate-spin h-5 w-5 text-[#1E3A5F]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Authenticating…
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Google GSI renders the button here */}
                <div ref={buttonRef} className="flex justify-center" />
                {!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    ⚠️ Google Client ID not configured – set <code>REACT_APP_GOOGLE_CLIENT_ID</code> in <code>.env</code>
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-slate-400">
              IT3030 – PAF 2026 · Group 71 · Faculty of Computing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
