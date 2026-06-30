/**
 * Demo seed data - used when MongoDB is not available or in demo mode
 * This lets users see the full UI without configuring MongoDB
 */

export const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.MONGODB_URI?.includes('mongodb');

export const DEMO_OVERVIEW = {
  current: {
    users: 48293,
    newUsers: 12847,
    sessions: 63419,
    pageViews: 189234,
    activeUsers: 342,
    avgEngagementTime: 187,
    bounceRate: 38.4,
    revenue: 2847.93,
    clicks: 15234,
    impressions: 1847293,
    cpm: 1.54,
    rpm: 15.04,
    ctr: 0.824,
    fillRate: 94.2,
  },
  previous: {
    users: 41832,
    sessions: 54219,
    pageViews: 162847,
    revenue: 2437.81,
    clicks: 12847,
    impressions: 1632948,
    rpm: 13.21,
  },
  changes: {
    users: 15.44,
    sessions: 16.97,
    pageViews: 16.21,
    revenue: 16.82,
    clicks: 18.58,
    impressions: 13.11,
    rpm: 13.85,
  },
};

function generateDailyData(days: number, baseUsers: number, baseRevenue: number) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayFactor = 0.7 + Math.random() * 0.6;
    const weekendFactor = [0, 6].includes(date.getDay()) ? 0.75 : 1;
    result.push({
      date: dateStr,
      users: Math.round(baseUsers * dayFactor * weekendFactor),
      sessions: Math.round(baseUsers * 1.31 * dayFactor * weekendFactor),
      pageViews: Math.round(baseUsers * 3.92 * dayFactor * weekendFactor),
      newUsers: Math.round(baseUsers * 0.265 * dayFactor),
      activeUsers: Math.round(baseUsers * 0.028),
      bounceRate: 35 + Math.random() * 10,
      avgEngagementTime: 150 + Math.random() * 80,
      revenue: parseFloat((baseRevenue * dayFactor * weekendFactor).toFixed(2)),
      clicks: Math.round(baseRevenue * 6.2 * dayFactor),
      impressions: Math.round(baseRevenue * 750 * dayFactor),
      cpm: parseFloat((1.2 + Math.random() * 0.8).toFixed(2)),
      rpm: parseFloat((12 + Math.random() * 6).toFixed(2)),
      ctr: parseFloat((0.6 + Math.random() * 0.5).toFixed(3)),
      fillRate: parseFloat((90 + Math.random() * 8).toFixed(1)),
    });
  }
  return result;
}

export function getDemoDays(range: string) {
  switch (range) {
    case 'today': return generateDailyData(1, 1560, 92);
    case 'yesterday': return generateDailyData(1, 1423, 87);
    case '7d': return generateDailyData(7, 1610, 95);
    case '30d': return generateDailyData(30, 1610, 95);
    case '90d': return generateDailyData(90, 1490, 88);
    case 'this_month': return generateDailyData(new Date().getDate(), 1610, 95);
    case 'last_month': return generateDailyData(30, 1380, 82);
    default: return generateDailyData(30, 1610, 95);
  }
}

export const DEMO_COUNTRIES = [
  { country: 'United States', countryCode: 'US', users: 18423, revenue: 1243.84, rpm: 67.52 },
  { country: 'United Kingdom', countryCode: 'GB', users: 6234, revenue: 284.91, rpm: 45.71 },
  { country: 'Vietnam', countryCode: 'VN', users: 5847, revenue: 48.23, rpm: 8.25 },
  { country: 'Canada', countryCode: 'CA', users: 3921, revenue: 198.34, rpm: 50.58 },
  { country: 'Australia', countryCode: 'AU', users: 2834, revenue: 173.42, rpm: 61.20 },
  { country: 'Germany', countryCode: 'DE', users: 2541, revenue: 142.18, rpm: 55.95 },
  { country: 'India', countryCode: 'IN', users: 2348, revenue: 32.47, rpm: 13.83 },
  { country: 'France', countryCode: 'FR', users: 1923, revenue: 98.24, rpm: 51.08 },
  { country: 'Singapore', countryCode: 'SG', users: 1234, revenue: 87.43, rpm: 70.85 },
  { country: 'Philippines', countryCode: 'PH', users: 987, revenue: 12.34, rpm: 12.50 },
];

export const DEMO_DEVICES = [
  { device: 'desktop', users: 24814, sessions: 32847, revenue: 1824.73 },
  { device: 'mobile', users: 19384, sessions: 25234, revenue: 821.43 },
  { device: 'tablet', users: 4095, sessions: 5338, revenue: 201.77 },
];

export const DEMO_PAGES = [
  { pagePath: '/', pageTitle: 'Home', pageViews: 48293, users: 32847, avgEngagementTime: 145, revenue: 423.84, rpm: 8.77 },
  { pagePath: '/blog/seo-tips-2024', pageTitle: 'SEO Tips 2024', pageViews: 18234, users: 12847, avgEngagementTime: 312, revenue: 234.91, rpm: 12.88 },
  { pagePath: '/tools/keyword-research', pageTitle: 'Keyword Research Tool', pageViews: 14827, users: 9234, avgEngagementTime: 487, revenue: 298.43, rpm: 20.13 },
  { pagePath: '/blog/content-marketing', pageTitle: 'Content Marketing Guide', pageViews: 11234, users: 7823, avgEngagementTime: 428, revenue: 187.23, rpm: 16.67 },
  { pagePath: '/blog/link-building', pageTitle: 'Link Building Strategies', pageViews: 9847, users: 6234, avgEngagementTime: 356, revenue: 156.84, rpm: 15.93 },
  { pagePath: '/about', pageTitle: 'About Us', pageViews: 7234, users: 5847, avgEngagementTime: 98, revenue: 42.34, rpm: 5.85 },
  { pagePath: '/contact', pageTitle: 'Contact', pageViews: 4123, users: 3921, avgEngagementTime: 67, revenue: 23.47, rpm: 5.69 },
  { pagePath: '/blog/backlinks-guide', pageTitle: 'Ultimate Backlinks Guide', pageViews: 13428, users: 8234, avgEngagementTime: 543, revenue: 312.47, rpm: 23.27 },
  { pagePath: '/pricing', pageTitle: 'Pricing', pageViews: 5234, users: 4823, avgEngagementTime: 234, revenue: 78.43, rpm: 14.99 },
  { pagePath: '/blog/technical-seo', pageTitle: 'Technical SEO Checklist', pageViews: 8923, users: 5847, avgEngagementTime: 398, revenue: 143.28, rpm: 16.06 },
];

export const DEMO_REALTIME = {
  activeUsers: 342,
  activePages: [
    { page: '/blog/seo-tips-2024', users: 87 },
    { page: '/', users: 64 },
    { page: '/tools/keyword-research', users: 53 },
    { page: '/blog/content-marketing', users: 42 },
    { page: '/blog/backlinks-guide', users: 38 },
    { page: '/pricing', users: 31 },
    { page: '/about', users: 27 },
  ],
};
