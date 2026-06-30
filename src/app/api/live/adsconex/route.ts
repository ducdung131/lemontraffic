import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const BASE = process.env.ADSCONEX_API_URL || 'https://fb-api-test.blogb.io/api';

let cachedAccessToken = process.env.ADSCONEX_ACCESS_TOKEN || '';

function parseJwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return (payload.exp || 0) * 1000;
  } catch { return 0; }
}

function isTokenExpired(token: string): boolean {
  return Date.now() >= parseJwtExpiry(token) - 60_000;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = process.env.ADSCONEX_REFRESH_TOKEN;
  if (!refreshToken) throw new Error('No refresh token configured');
  for (const ep of [`${BASE}/auth/refresh-token`, `${BASE}/auth/refresh`, `${BASE}/refresh-token`]) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cookie': `refresh_token=${refreshToken}` },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        const t = data?.access_token || data?.token || data?.data?.access_token;
        if (t) { cachedAccessToken = t; return t; }
      }
    } catch { continue; }
  }
  throw new Error('Không thể làm mới token. Cần cập nhật ADSCONEX_ACCESS_TOKEN trong .env.local');
}

async function getValidToken(): Promise<string> {
  if (cachedAccessToken && !isTokenExpired(cachedAccessToken)) return cachedAccessToken;
  return refreshAccessToken();
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  if (!cachedAccessToken) {
    return NextResponse.json({ error: 'Chưa cấu hình ADSCONEX_ACCESS_TOKEN', configured: false }, { status: 400 });
  }

  // Always all-time
  const preset = 'all_time';

  try {
    const token = await getValidToken();
    const url = `${BASE}/dashboard/monetization?preset=${preset}&kpi_page=1&kpi_per_page=100`;
    const hdrs = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://plan.blogb.io',
      'Referer': 'https://plan.blogb.io/',
    };

    let res = await fetch(url, { headers: { ...hdrs, 'Cookie': `access_token=${token}` }, signal: AbortSignal.timeout(10000) });
    if (!res.ok && res.status === 401) {
      res = await fetch(url, { headers: { ...hdrs, 'Authorization': `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
    }
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      res = await fetch(url, { headers: { ...hdrs, 'Cookie': `access_token=${newToken}`, 'Authorization': `Bearer ${newToken}` }, signal: AbortSignal.timeout(10000) });
    }

    // Check if response is actually JSON
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({
        configured: true,
        error: 'TOKEN_INVALID',
        message: 'Token Adsconex hết hạn. Cần lấy token mới từ plan.blogb.io (DevTools → Application → Cookies → access_token)',
      }, { status: 401 });
    }

    const raw = await res.json();
    console.log('[Adsconex] status:', res.status, '| preset:', preset);

    if (!res.ok) {
      return NextResponse.json({ configured: true, error: 'API_ERROR', status: res.status, message: raw?.message || `HTTP ${res.status}`, raw }, { status: res.status });
    }

    const payload = raw?.data ?? raw;
    const revenue = Number(payload?.ads_total ?? payload?.total ?? 0);
    const currency = payload?.currency ?? 'USD';
    const change = Number(payload?.change_percent ?? 0);

    const daily = (payload?.series || []).map((s: { date: string; ads_value: number; value: number }) => ({
      date: s.date,
      revenue: Number(s.ads_value ?? 0),
      total: Number(s.value ?? 0),
    }));

    const websites = payload?.adsconex_websites || [];
    const perWebsite = payload?.per_website_earnings || {};
    const websiteBreakdown = websites.map((w: { id: number; domain: string }) => ({
      id: w.id,
      domain: w.domain,
      revenue: Number(perWebsite[String(w.id)] ?? 0),
    }));

    return NextResponse.json({ configured: true, preset, currency, revenue, change, daily, websites: websiteBreakdown });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Adsconex]', msg);
    return NextResponse.json({ configured: true, error: 'ERROR', message: msg }, { status: 500 });
  }
}
