import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

function extractProjectId(errorText: string): string | null {
  const match = errorText.match(/project[_\s](\d+)/);
  return match ? match[1] : null;
}

// Reusable: get a GA4 access token from service account credentials
async function getGA4Token(): Promise<string> {
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) throw new Error('Thiếu thông tin xác thực GA4');

  const { SignJWT } = await import('jose');
  const now = Math.floor(Date.now() / 1000);

  // Parse PEM → DER
  const base64 = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '').trim();
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const jwt = await new SignJWT({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }).setProtectedHeader({ alg: 'RS256' }).sign(cryptoKey);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });

  if (!res.ok) throw new Error(`Không lấy được token GA4: ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token;
}

// Run a GA4 report
async function runGA4Report(token: string, propertyId: string, body: Record<string, unknown>) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`GA4 API lỗi: ${await res.text()}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) return NextResponse.json({ error: 'Thiếu GA4_PROPERTY_ID' }, { status: 500 });

  // All-time: GA4 launched Oct 2020, dùng 2020-08-01 để bao hết
  const startDate = '2020-08-01';
  const endDate = 'today';

  try {
    const token = await getGA4Token();

    // 1. Tổng quan (totals)
    const totalsReport = await runGA4Report(token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    // 2. Daily chart data
    const dailyReport = await runGA4Report(token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });

    // 3. Top pages
    const pagesReport = await runGA4Report(token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20,
    });

    // 4. Countries
    const countriesReport = await runGA4Report(token, propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }, { name: 'countryId' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit: 15,
    });

    // Parse totals — GA4 dimensionless report puts data in rows[0] or totals[0]
    const totalsRow = totalsReport.rows?.[0] || totalsReport.totals?.[0];
    console.log('[GA4 raw totals]', JSON.stringify({ rowCount: totalsReport.rowCount, rows: totalsReport.rows, totals: totalsReport.totals }));
    const mv = (totalsRow?.metricValues || []).map((v: { value: string }) => v.value);
    const totals = {
      users: parseInt(mv[0] || '0'),
      newUsers: parseInt(mv[1] || '0'),
      sessions: parseInt(mv[2] || '0'),
      pageViews: parseInt(mv[3] || '0'),
      activeUsers: parseInt(mv[4] || '0'),
      bounceRate: parseFloat(parseFloat(mv[5] || '0').toFixed(1)),
      avgSessionDuration: parseFloat(parseFloat(mv[6] || '0').toFixed(0)),
    };
    console.log('[GA4 parsed totals]', totals);

    // Parse daily
    const daily = (dailyReport.rows || []).map((row: { dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }) => {
      const d = row.dimensionValues?.[0]?.value || '';
      const date = d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d;
      return {
        date,
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
      };
    });

    // Parse pages
    const pages = (pagesReport.rows || []).slice(0, 20).map((row: { dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }) => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    }));

    // Parse countries
    const countries = (countriesReport.rows || []).map((row: { dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }) => ({
      country: row.dimensionValues?.[0]?.value || '',
      countryCode: row.dimensionValues?.[1]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    }));

    return NextResponse.json({ totals, daily, pages, countries, source: 'ga4-live' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
    console.error('[API /live/ga4]', msg);

    // Detect "API not enabled" error
    if (msg.includes('has not been used') || msg.includes('is disabled')) {
      const projectId = extractProjectId(msg) || '293486135334';
      return NextResponse.json({
        error: 'GA4_API_DISABLED',
        message: 'Google Analytics Data API chưa được bật',
        fix: `https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview?project=${projectId}`,
        projectId,
      }, { status: 503 });
    }

    // Detect "permission denied" — service account not added to GA4 property
    if (msg.includes('PERMISSION_DENIED') || msg.includes('does not have sufficient permissions') || msg.includes('403')) {
      return NextResponse.json({
        error: 'GA4_PERMISSION_DENIED',
        serviceAccount: process.env.GA4_CLIENT_EMAIL,
        propertyId: process.env.GA4_PROPERTY_ID,
        message: 'Service account chưa được cấp quyền truy cập GA4 property',
        fix: 'Vào GA4 Admin → Property Access Management → Add user với email service account',
        steps: [
          `Mở: https://analytics.google.com/analytics/web/#/a543633263p${process.env.GA4_PROPERTY_ID}/admin/userManagement/`,
          `Nhấn "+ Add users"`,
          `Nhập email: ${process.env.GA4_CLIENT_EMAIL}`,
          `Chọn role: "Viewer" (tối thiểu)`,
          `Nhấn Add`,
        ],
      }, { status: 403 });
    }

    // Detect "property not found" or "not found" errors
    if (msg.includes('not found') || msg.includes('INVALID_ARGUMENT')) {
      return NextResponse.json({
        error: 'GA4_PROPERTY_NOT_FOUND',
        message: `Không tìm thấy property GA4: ${process.env.GA4_PROPERTY_ID}`,
        fix: 'Kiểm tra lại GA4_PROPERTY_ID trong .env.local',
      }, { status: 404 });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
