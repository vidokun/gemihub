'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import UserTable from '@/components/UserTable';
import UserForm from '@/components/UserForm';
import {
  getAllUsers,
  createUser,
  deleteUser,
} from '@/lib/supabase/operations/users';
import type { PublicUser } from '@/lib/types';

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-[var(--accent)]"
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
  );
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (
    email: string,
    displayName: string,
    password: string,
    role: 'admin' | 'user',
  ) => {
    await createUser(email, displayName, password, role);
    setShowModal(false);
    await fetchUsers();
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setActionLoading(true);
    try {
      await deleteUser(id);
      setDeleteId(null);
      await fetchUsers();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Users
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage dashboard access for administrators and users.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="
            inline-flex items-center gap-2
            h-10 px-4 rounded-lg
            bg-[var(--accent)]
            text-white text-sm font-semibold
            transition-colors duration-150 ease-out
            hover:opacity-90
          "
        >
          <PlusIcon />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <UserTable
          users={users}
          onDelete={(id) => setDeleteId(id)}
          deletingId={deletingId}
        />
      )}

      {showModal && (
        <UserForm
          onClose={() => setShowModal(false)}
          onSubmit={handleAddUser}
        />
      )}

      {deleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteId(null);
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            className="
              relative w-full max-w-sm mx-4
              bg-[var(--card)]
              border border-[var(--border)]
              rounded-xl
              shadow-xl
              px-6 py-5
            "
          >
            <h2 className="text-base font-semibold text-[var(--text)]">
              Delete User
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2">
              This action cannot be undone. The user will lose access immediately and all their sessions will be revoked.
            </p>

            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={actionLoading}
                className="
                  h-9 px-4 rounded-lg
                  text-sm font-medium text-[var(--text)]
                  border border-[var(--border)]
                  hover:bg-[var(--border)]
                  transition-colors duration-150 ease-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                disabled={actionLoading}
                className="
                  h-9 px-4 rounded-lg
                  text-sm font-semibold text-white
                  bg-red-600
                  hover:bg-red-500
                  inline-flex items-center gap-2
                  transition-colors duration-150 ease-out
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5"
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
                    <span>Deleting</span>
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
