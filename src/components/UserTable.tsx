'use client';

import type { PublicUser } from '@/lib/types';

interface UserTableProps {
  users: PublicUser[];
  onDelete: (id: number) => void;
  deletingId: number | null;
}

function TrashIcon() {
  return (
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UserTable({ users, onDelete, deletingId }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-sm text-[var(--muted)]">No users found</p>
        <p className="text-xs text-[var(--muted)] mt-1 opacity-60">
          Create an admin user to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--bg)]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Display Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {users.map((user) => (
            <tr key={user.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-3 text-sm text-[var(--text)] font-medium">
                {user.display_name}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--muted)]">
                {user.email}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full
                    text-xs font-medium border
                    ${
                      user.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-[var(--muted)]/10 text-[var(--muted)] border-[var(--border)]'
                    }
                  `}
                >
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--muted)] tabular-nums">
                {formatDate(user.created_at)}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onDelete(user.id)}
                  disabled={deletingId === user.id}
                  className="
                    p-1.5 rounded-lg
                    text-[var(--muted)]
                    hover:text-red-400 hover:bg-red-500/10
                    transition-colors duration-150 ease-out
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  aria-label={`Delete ${user.display_name}`}
                >
                  {deletingId === user.id ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <TrashIcon />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
