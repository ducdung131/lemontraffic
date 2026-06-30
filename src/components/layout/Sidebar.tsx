'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, TrendingUp, DollarSign, FileText,
  Globe, Monitor, Radio, Lightbulb, RefreshCw,
  Settings, LogOut, BarChart2, ArrowUpDown
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/realtime', icon: Radio, label: 'Thời gian thực' },
    ],
  },
  {
    label: 'Traffic',
    items: [
      { href: '/dashboard/traffic', icon: TrendingUp, label: 'Phân tích Traffic' },
      { href: '/dashboard/sources', icon: ArrowUpDown, label: 'Nguồn Traffic' },
      { href: '/dashboard/countries', icon: Globe, label: 'Theo Quốc gia' },
      { href: '/dashboard/devices', icon: Monitor, label: 'Theo Thiết bị' },
      { href: '/dashboard/pages', icon: FileText, label: 'Top Trang' },
    ],
  },
  {
    label: 'Doanh thu',
    items: [
      { href: '/dashboard/revenue', icon: DollarSign, label: 'Doanh thu Ads' },
      { href: '/dashboard/insights', icon: Lightbulb, label: 'Insights tự động' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { href: '/dashboard/sync', icon: RefreshCw, label: 'Đồng bộ dữ liệu' },
      { href: '/dashboard/settings', icon: Settings, label: 'Cài đặt' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#ff5f8f,#ff9f43,#ffd93d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <BarChart2 size={18} color="white" />
          </div>
          <div>
            <div className="logo-title">Analytics Hub</div>
            <div className="logo-sub">Trung tâm phân tích</div>
          </div>
        </div>
      </div>

      {/* User info */}
      {session?.user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {session.user.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-user-name">{session.user.name || 'Admin'}</div>
            <div className="sidebar-user-role">Quản trị viên</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map(item => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => router.push(item.href)}
              >
                <item.icon size={17} />
                {item.label}
              </button>
            );
          })}
        </div>
      ))}

      {/* Logout */}
      <button
        className="nav-logout"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        <LogOut size={15} />
        Đăng xuất
      </button>
    </aside>
  );
}
