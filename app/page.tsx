"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useRooms } from "@/hooks/useRooms";
import { MessageSquare, Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const rooms = useRooms();

  const handleCreateRoom = async () => {
    const room = await rooms.createRoom();
    if (room?.id) {
      router.push(`/room/${room.id}`);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[color:var(--bg-primary)]">
        <div className="w-full max-w-2xl">
          {/* Create Room Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold tracking-wider uppercase text-[color:var(--text-secondary)] font-mono mb-4">
              Create New Room
            </h2>
            <div className="flex gap-3">
              <input
                value={rooms.newRoomName}
                onChange={(e) => rooms.setNewRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateRoom();
                }}
                placeholder="Enter room name..."
                className="flex-1 bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] rounded-lg px-4 py-3 text-sm font-mono outline-none focus:border-[color:var(--accent)] text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              />
              <button
                onClick={handleCreateRoom}
                className="bg-[color:var(--accent)] hover:bg-[color:var(--accent)]/90 text-black px-6 py-3 rounded-lg font-mono font-bold uppercase tracking-wider text-xs transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.15)] hover:shadow-[0_0_25px_rgba(200,255,0,0.3)] flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Create
              </button>
            </div>
          </div>

          {/* Room List */}
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-[color:var(--text-secondary)] font-mono mb-4">
              Your Rooms ({rooms.rooms.length})
            </h2>

            {rooms.rooms.length === 0 ? (
              <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] rounded-lg p-12 text-center">
                <MessageSquare className="w-8 h-8 text-[color:var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-xs font-mono text-[color:var(--text-muted)] tracking-wider">
                  NO ROOMS YET. CREATE ONE ABOVE.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {rooms.rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => router.push(`/room/${room.id}`)}
                    className="group bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)] hover:border-[color:var(--accent-glow)] rounded-lg p-4 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[color:var(--accent-dim)] p-2 rounded border border-[color:var(--accent-glow)]">
                        <MessageSquare className="w-4 h-4 text-[color:var(--accent)]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[color:var(--text-primary)] font-mono tracking-wide">
                          {room.name}
                        </h3>
                        <p className="text-[10px] text-[color:var(--text-muted)] font-mono">
                          {room._count?.sessions ?? 0} sessions
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[color:var(--text-muted)] group-hover:text-[color:var(--accent)] transition-colors">
                      OPEN →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
