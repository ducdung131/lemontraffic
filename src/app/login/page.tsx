'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, BarChart2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();

      // 2. POST credentials directly
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          csrfToken,
          email,
          password,
          json: 'true',
        }),
        redirect: 'follow',
      });

      // 3. Check if login succeeded by checking session
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user) {
        window.location.href = '/dashboard';
        return;
      } else {
        setError('Email hoặc mật khẩu không đúng.');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fc' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        <div style={{
          background: 'white', borderRadius: 28, padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(0,0,0,.08)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg,#ff5f8f,#ff9f43,#ffd93d)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <BarChart2 size={26} color="white" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111', marginBottom: 6 }}>
              Đăng nhập
            </h2>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12,
              padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626', fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#ff9f43'; e.target.style.boxShadow = '0 0 0 3px rgba(255,159,67,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#ff9f43'; e.target.style.boxShadow = '0 0 0 3px rgba(255,159,67,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', border: 'none', borderRadius: 999, padding: 14,
                fontSize: 16, fontWeight: 700, color: 'white', cursor: loading ? 'wait' : 'pointer',
                background: 'linear-gradient(90deg, #ff5f8f, #ff9f43, #ffd93d)',
                transition: '0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
