'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface CurrentUser {
  display_name: string;
  email: string;
  role: string;
}

const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const KeysIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M7 16l4-8 4 4 4-6" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  { href: '/keys', label: 'API Keys', icon: <KeysIcon /> },
  { href: '/users', label: 'Users', icon: <UsersIcon /> },
  { href: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className="
        flex flex-col shrink-0
        w-56 lg:w-56
        max-lg:w-16
        h-screen
        bg-[var(--card)]
        border-r border-[var(--border)]
        overflow-y-auto overflow-x-hidden
        transition-[width] duration-200 ease-out-quint
      "
    >
      <div className="flex items-center gap-3 h-14 shrink-0 px-4 border-b border-[var(--border)]">
        <span className="text-[var(--accent)] shrink-0" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </span>
        <span className="text-[var(--text)] font-semibold text-base truncate max-lg:hidden">
          GemiHub
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-3 mt-1 flex-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3
                h-10 px-3 rounded-lg
                text-sm font-medium
                transition-colors duration-150 ease-out
                ${
                  isActive
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
                }
              `}
            >
              <span className="shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              <span className="truncate max-lg:hidden">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-3 max-lg:justify-center">
          {user ? (
            <>
              <div
                className="
                  shrink-0 w-8 h-8 rounded-full
                  bg-[var(--accent)]/15 text-[var(--accent)]
                  flex items-center justify-center
                  text-sm font-semibold
                "
                aria-hidden="true"
              >
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 max-lg:hidden">
                <p className="text-sm font-medium text-[var(--text)] truncate">
                  {user.display_name}
                </p>
                <p className="text-xs text-[var(--muted)] truncate">
                  {user.email}
                </p>
              </div>
            </>
          ) : (
            <div className="min-w-0 max-lg:hidden">
              <p className="text-xs text-[var(--muted)]">Memuat...</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              shrink-0 p-1.5 rounded-lg
              text-[var(--muted)]
              hover:text-red-400 hover:bg-red-500/10
              transition-colors duration-150 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
              ml-auto
            "
            aria-label="Logout"
            title="Logout"
          >
            {loggingOut ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            ) : (
              <LogoutIcon />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
