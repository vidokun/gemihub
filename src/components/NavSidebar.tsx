'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
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

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/keys', label: 'API Keys', icon: <KeysIcon /> },
];

export default function NavSidebar() {
  const pathname = usePathname();

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

      <nav className="flex flex-col gap-1 p-3 mt-1" aria-label="Main navigation">
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
    </aside>
  );
}
