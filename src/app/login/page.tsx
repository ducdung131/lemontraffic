'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, BarChart2, DollarSign, TrendingUp } from 'lucide-react';

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
      const res = await Promise.race([
        signIn('credentials', { email, password, redirect: false }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      if (!res || res.error) {
        setError('Email hoặc mật khẩu không đúng.');
      } else {
        router.push('/dashboard');
        return; // don't reset loading — page is navigating
      }
    } catch (err) {
      setError(err instanceof Error && err.message === 'timeout'
        ? 'Kết nối quá lâu. Kiểm tra lại cấu hình server.'
        : 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 48, alignItems: 'center', maxWidth: 880, width: '100%', padding: '0 24px' }}>

        {/* Left — brand */}
        <div style={{ flex: 1, display: 'none' }} className="login-brand">
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: 'white', borderRadius: 20, padding: '12px 20px',
              boxShadow: '0 0 25px rgba(255,217,61,.35)', border: '2px solid #fff4d0',
              marginBottom: 28
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#ff5f8f,#ff9f43,#ffd93d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BarChart2 size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#111' }}>Lemon</div>
                <div style={{ fontSize: 11, color: '#999' }}>Traffic</div>
              </div>
            </div>
          </div>

          <h1 style={{
            fontSize: 44, fontWeight: 900, lineHeight: 1.2, marginBottom: 14,
            background: 'linear-gradient(90deg,#ff5f8f,#ff9f43,#ffd93d)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Một nơi.<br />Toàn bộ dữ liệu.
          </h1>
          <p style={{ fontSize: 16, color: '#555', lineHeight: 1.7, maxWidth: 340 }}>

          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: <TrendingUp size={16} color="#ff9f43" />, text: 'Phân tích traffic chi tiết', bg: '#fff3e0' },
              { icon: <DollarSign size={16} color="#22c55e" />, text: 'Theo dõi doanh thu Adsconex', bg: '#ecfdf5' },
              { icon: <BarChart2 size={16} color="#6366f1" />, text: 'Insights tự động từ dữ liệu', bg: '#ede9fe' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login form */}
        <div style={{
          background: 'white', borderRadius: 35, padding: '45px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.08)', width: '100%', maxWidth: 440,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg,#ff5f8f,#ff9f43,#ffd93d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <BarChart2 size={24} color="white" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111', marginBottom: 6 }}>
              Đăng nhập
            </h2>
            <p style={{ fontSize: 14, color: '#888' }}></p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                Địa chỉ Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder=""
                autoComplete="email"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 14, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#ff9f43'; e.target.style.boxShadow = '0 0 0 3px rgba(255,159,67,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 14, outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#ff9f43'; e.target.style.boxShadow = '0 0 0 3px rgba(255,159,67,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13, fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', border: 'none', borderRadius: 999,
                padding: '14px', fontSize: 16, fontWeight: 700, color: 'white', cursor: 'pointer',
                background: 'linear-gradient(90deg, #ff5f8f, #ff9f43, #ffd93d)',
                transition: '0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.75 : 1,
              }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 25px rgba(255,159,67,0.35)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 20 }}>

          </p>
        </div>
      </div>
    </div>
  );
}
