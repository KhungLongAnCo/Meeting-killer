"use client";

import { Loader2, Target } from "lucide-react";

export type LoginScreenProps = {
  username: string;
  onUsernameChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export const LoginScreen = ({
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  error,
  loading,
  onSubmit,
}: LoginScreenProps) => {
  return (
    <main className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-[color:var(--accent-dim)] p-2 rounded border border-[color:var(--accent-glow)]">
            <Target className="w-6 h-6 text-[color:var(--accent)]" />
          </div>
          <h1 className="text-lg font-bold tracking-wider uppercase font-sans text-[color:var(--text-primary)]">
            Meeting <span className="text-[color:var(--accent)]">Killer</span>
          </h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] rounded-lg p-6 space-y-4"
        >
          <div className="space-y-1">
            <label className="text-[9px] text-[color:var(--text-secondary)] uppercase font-mono tracking-widest font-bold">
              Username
            </label>
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="w-full bg-[color:var(--bg-primary)] border border-[color:var(--border-subtle)] rounded px-3 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)] text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              placeholder="admin"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-[color:var(--text-secondary)] uppercase font-mono tracking-widest font-bold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full bg-[color:var(--bg-primary)] border border-[color:var(--border-subtle)] rounded px-3 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)] text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs font-mono text-[color:var(--danger)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-[color:var(--accent)] hover:bg-[color:var(--accent)]/90 text-black py-2.5 rounded font-mono font-bold uppercase tracking-wider text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(200,255,0,0.15)] hover:shadow-[0_0_25px_rgba(200,255,0,0.3)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "ACCESS SYSTEM"
            )}
          </button>
        </form>

        <p className="text-center text-[color:var(--text-muted)] text-[10px] font-mono mt-4 tracking-wider">
          AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </main>
  );
};
