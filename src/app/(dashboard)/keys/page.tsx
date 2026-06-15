'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import KeyTable from '@/components/KeyTable';
import KeyForm from '@/components/KeyForm';
import {
  getAllKeys,
  createApiKey,
  toggleApiKey,
  deleteApiKey,
  getKeyUsageCounts,
} from '@/lib/supabase/operations/api-keys';
import type { ApiKey } from '@/lib/types';

const PAGE_SIZE = 10;

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

function ChevronLeftIcon() {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
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
      <polyline points="9 18 15 12 9 6" />
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

export default function KeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<number, number>>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const [data, counts] = await Promise.all([
        getAllKeys(),
        getKeyUsageCounts(),
      ]);
      setKeys(data);
      setUsageCounts(counts);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const filtered = keys.filter((k) =>
    k.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedKeys = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const handleAddKey = async (name: string, keyString: string) => {
    await createApiKey(name, keyString);
    setShowModal(false);
    await fetchKeys();
    router.refresh();
  };

  const handleToggle = async (id: number) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await toggleApiKey(id);
      await fetchKeys();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle API key');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(true);
    try {
      await deleteApiKey(id);
      setDeleteId(null);
      await fetchKeys();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
            API Keys
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage your Gemini API keys for the gateway.
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
          Add Key
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search keys by name"
          className="
            w-full max-w-xs h-10 px-3.5 rounded-lg
            bg-[var(--card)]
            border border-[var(--border)]
            text-[var(--text)] text-sm
            placeholder:text-[var(--muted)]
            outline-none
            transition-colors duration-150 ease-out
            focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30
          "
        />
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
        <>
          <KeyTable
            keys={paginatedKeys}
            usageCounts={usageCounts}
            loadingIds={loadingIds}
            onToggle={handleToggle}
            onDelete={(id) => setDeleteId(id)}
          />

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[var(--muted)]">
                Showing {safePage * PAGE_SIZE + 1}
                {' '}-{' '}
                {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
                {' '}of{' '}{filtered.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="
                    p-2 rounded-lg
                    text-[var(--muted)]
                    border border-[var(--border)]
                    hover:text-[var(--text)] hover:bg-[var(--border)]
                    transition-colors duration-150 ease-out
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon />
                </button>

                <span className="px-3 text-sm text-[var(--muted)] tabular-nums">
                  {safePage + 1} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="
                    p-2 rounded-lg
                    text-[var(--muted)]
                    border border-[var(--border)]
                    hover:text-[var(--text)] hover:bg-[var(--border)]
                    transition-colors duration-150 ease-out
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                  aria-label="Next page"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <KeyForm
          onClose={() => setShowModal(false)}
          onSubmit={handleAddKey}
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
              Delete API Key
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2">
              This action cannot be undone. The API key will stop working immediately.
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
