'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, LogOut, Radio } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

// ── helpers ──────────────────────────────────────────────
function n(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(1) + 'K';
  return v.toLocaleString('vi-VN');
}
function dur(s: number) {
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return m > 0 ? `${m}p ${sec}s` : `${sec}s`;
}
const FLAGS: Record<string, string> = {
  'United States': '🇺🇸', 'Vietnam': '🇻🇳', 'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦', 'Australia': '🇦🇺', 'India': '🇮🇳', 'Germany': '🇩🇪',
  'France': '🇫🇷', 'Singapore': '🇸🇬', 'Philippines': '🇵🇭',
  'Indonesia': '🇮🇩', 'Thailand': '🇹🇭', 'Malaysia': '🇲🇾', 'Japan': '🇯🇵',
};

const CARD = ({ label, value, color, big }: { label: string; value: string; color: string; big?: boolean }) => (
  <div style={{ background: 'white', borderRadius: 18, padding: '18px 20px', borderLeft: `4px solid ${color}`, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
    <p style={{ fontSize: big ? 28 : 26, fontWeight: 900, color: big ? color : '#111' }}>{value}</p>
  </div>
);

// ── Live timer ────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const update = () => setT(new Date().toLocaleTimeString('vi-VN'));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontSize: 12, color: '#aaa', fontVariantNumeric: 'tabular-nums' }}>{t}</span>;
}

// ── Main ──────────────────────────────────────────────────
export default function DashboardPage() {

  // GA4 — auto-refresh mỗi 60 giây
  const ga4 = useQuery({
    queryKey: ['ga4-alltime'],
    queryFn: () => axios.get('/api/live/ga4').then(r => r.data),
    staleTime: 55_000,
    refetchInterval: 60_000,
    retry: 0,
  });

  // Adsconex — auto-refresh mỗi 120 giây
  const ads = useQuery({
    queryKey: ['ads-alltime'],
    queryFn: () => axios.get('/api/live/adsconex').then(r => r.data).catch(e => e?.response?.data ?? null),
    staleTime: 115_000,
    refetchInterval: 120_000,
    retry: 0,
  });

  const t = ga4.data?.totals;
  const totalRevenue = Number(ads.data?.revenue ?? 0);
  const errData = (ga4.error as { response?: { data?: { error?: string; message?: string; serviceAccount?: string } } })?.response?.data;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 28px' }}>

      {/* ── Topbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#ff5f8f,#ff9f43,#ffd93d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18 }}>A</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#111', lineHeight: 1.2 }}>Lemon Traffic</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>REALTIME</span>
              </div>
              <span style={{ fontSize: 11, color: '#ccc' }}>·</span>
              <LiveClock />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Last updated indicator */}
          {ga4.dataUpdatedAt > 0 && (
            <span style={{ fontSize: 11, color: '#bbb' }}>
              Cập nhật: {new Date(ga4.dataUpdatedAt).toLocaleTimeString('vi-VN')}
            </span>
          )}
          <button onClick={() => { ga4.refetch(); ads.refetch(); }}
            style={{ padding: '7px 14px', borderRadius: 999, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontWeight: 700, fontSize: 13 }}>
            <RefreshCw size={13} style={(ga4.isFetching || ads.isFetching) ? { animation: 'spin 1s linear infinite' } : {}} />
            Làm mới
          </button>
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ padding: '7px 12px', borderRadius: 999, border: '1.5px solid #fde8e8', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#ef4444', fontWeight: 700, fontSize: 13 }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {ga4.isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80, gap: 14 }}>
          <div style={{ width: 38, height: 38, border: '3px solid #f0f0f0', borderTopColor: '#ff9f43', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#aaa', fontSize: 14 }}>Đang lấy dữ liệu từ Google Analytics...</p>
        </div>
      )}

      {/* ── Error ── */}
      {ga4.isError && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 16, padding: '18px 22px', maxWidth: 580, marginBottom: 20 }}>
          <p style={{ fontWeight: 800, color: '#92400e', marginBottom: 6, fontSize: 14 }}>
            {errData?.error === 'GA4_PERMISSION_DENIED' ? '⚠️ Service account chưa có quyền truy cập GA4' : '⚠️ Lỗi kết nối GA4'}
          </p>
          <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7 }}>
            {errData?.error === 'GA4_PERMISSION_DENIED'
              ? <><a href="https://analytics.google.com/" target="_blank" rel="noreferrer" style={{ color: '#ff9f43', fontWeight: 700 }}>Google Analytics</a> → Admin → Property Access Management → thêm <code style={{ background: '#fde68a', padding: '1px 5px', borderRadius: 4 }}>{errData?.serviceAccount}</code> role <b>Viewer</b></>
              : errData?.message || String(ga4.error)}
          </p>
        </div>
      )}

      {/* ── GA4 DATA ── */}
      {t && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Radio size={13} color="#ff9f43" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Traffic</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* 8 metric cards — phiên làm việc → tổng doanh thu */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <CARD label="Lượt xem trang" value={n(t.pageViews)} color="#ff9f43" />
            <CARD label="Người dùng" value={n(t.users)} color="#6366f1" />
            {/* Thay phiên làm việc → tổng doanh thu Adsconex */}
            <CARD
              label="Tổng doanh thu"
              value={ads.isLoading ? '...' : `$${totalRevenue.toFixed(2)}`}
              color="#22c55e"
              big
            />
            <CARD label="Người dùng mới" value={n(t.newUsers)} color="#06b6d4" />
            <CARD label="Đang online" value={n(t.activeUsers)} color="#ec4899" />
            <CARD label="Bounce Rate" value={`${t.bounceRate}%`} color={t.bounceRate > 70 ? '#ef4444' : '#14b8a6'} />
            <CARD label="Thời gian TB/phiên" value={dur(t.avgSessionDuration)} color="#f97316" />
            <CARD label="Trang / Phiên" value={t.sessions > 0 ? (t.pageViews / t.sessions).toFixed(1) : '0'} color="#a855f7" />
          </div>

          {/* Chart — pageviews by date */}
          {ga4.data?.daily?.length > 1 && (
            <div style={{ background: 'white', borderRadius: 18, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20 }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: '#111', marginBottom: 4 }}>Lượt xem theo ngày</p>
              <p style={{ fontSize: 12, color: '#bbb', marginBottom: 16 }}>{ga4.data.daily.length} ngày · toàn bộ lịch sử</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ga4.data.daily} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gPV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9f43" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ff9f43" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ccc' }} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#ccc' }} tickLine={false} axisLine={false} tickFormatter={v => n(v)} width={32} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }} formatter={(v: any, name: any) => [n(Number(v)), name === 'pageViews' ? 'Lượt xem' : 'Người dùng']} />
                  <Area type="monotone" dataKey="pageViews" name="Lượt xem" stroke="#ff9f43" strokeWidth={2.5} fill="url(#gPV)" dot={false} />
                  <Area type="monotone" dataKey="users" name="Người dùng" stroke="#6366f1" strokeWidth={2} fill="url(#gU)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top pages + Countries */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <div style={{ background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f5f5', fontWeight: 800, fontSize: 13, color: '#111' }}>
                Top trang ({ga4.data.pages?.length || 0})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#fafafa' }}>
                  <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase' }}>Trang</th>
                  <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase' }}>Xem</th>
                  <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase' }}>User</th>
                </tr></thead>
                <tbody>
                  {(ga4.data.pages || []).slice(0, 12).map((p: { path: string; title: string; pageViews: number; users: number }, i: number) => (
                    <tr key={p.path} style={{ borderTop: '1px solid #fafafa' }}>
                      <td style={{ padding: '9px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#222', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.title || p.path}>{i + 1}. {p.title || p.path}</div>
                        <div style={{ fontSize: 11, color: '#ddd' }}>{p.path}</div>
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 800, color: '#ff9f43' }}>{n(p.pageViews)}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#6366f1' }}>{n(p.users)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f5f5', fontWeight: 800, fontSize: 13, color: '#111' }}>Theo quốc gia</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#fafafa' }}>
                  <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase' }}>Quốc gia</th>
                  <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase' }}>User</th>
                  <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#ccc', textTransform: 'uppercase' }}>Phiên</th>
                </tr></thead>
                <tbody>
                  {(ga4.data.countries || []).slice(0, 12).map((c: { country: string; users: number; sessions: number }) => (
                    <tr key={c.country} style={{ borderTop: '1px solid #fafafa' }}>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ fontSize: 16, marginRight: 8 }}>{FLAGS[c.country] || '🌐'}</span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>{c.country}</span>
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 800, color: '#ff9f43' }}>{n(c.users)}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#888' }}>{n(c.sessions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── ADSCONEX ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Radio size={13} color="#22c55e" />
        <span style={{ fontSize: 12, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Doanh thu Adsconex · Toàn thời gian</span>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        {ads.data?.preset && <span style={{ fontSize: 11, color: '#bbb' }}>{ads.data.preset}</span>}
      </div>

      {ads.isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: '#aaa', fontSize: 13 }}>
          <div style={{ width: 18, height: 18, border: '2px solid #f0f0f0', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Đang lấy dữ liệu doanh thu...
        </div>
      )}

      {ads.data && !ads.data.error && ads.data.configured !== false ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'white', borderRadius: 18, padding: '18px 20px', borderLeft: '4px solid #22c55e', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Tổng doanh thu</p>
              <p style={{ fontSize: 30, fontWeight: 900, color: '#16a34a' }}>${totalRevenue.toFixed(2)}</p>
              {Number(ads.data.change) !== 0 && (
                <p style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: Number(ads.data.change) >= 0 ? '#16a34a' : '#ef4444' }}>
                  {Number(ads.data.change) >= 0 ? '↑' : '↓'} {Math.abs(Number(ads.data.change)).toFixed(1)}%
                </p>
              )}
            </div>
            {(ads.data.websites || []).map((w: { domain: string; revenue: number }) => (
              <div key={w.domain} style={{ background: 'white', borderRadius: 18, padding: '18px 20px', borderLeft: '4px solid #06b6d4', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={w.domain}>{w.domain}</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#0e7490' }}>${Number(w.revenue).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {ads.data.daily?.length > 1 && (
            <div style={{ background: 'white', borderRadius: 18, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: '#111', marginBottom: 4 }}>Doanh thu theo ngày</p>
              <p style={{ fontSize: 12, color: '#bbb', marginBottom: 16 }}>{ads.data.daily.length} ngày · {ads.data.currency || 'USD'}</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={ads.data.daily} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ccc' }} tickLine={false} axisLine={false} tickFormatter={d => d?.slice(5) ?? d} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#ccc' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={38} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }} formatter={(v: any) => [`$${Number(v).toFixed(3)}`, 'Doanh thu']} />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} fill="url(#gRev)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : ads.data?.error && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 10, maxWidth: 520 }}>
          <span style={{ color: '#ef4444', fontWeight: 800, fontSize: 13 }}>
            {ads.data.error === 'TOKEN_INVALID' ? '🔑 Token hết hạn' : '❌ Lỗi Adsconex'}
          </span>
          <p style={{ fontSize: 12, color: '#ef4444', marginLeft: 4 }}>{ads.data.message}</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
