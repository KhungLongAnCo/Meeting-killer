"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  MessageSquare,
  Pencil,
  X,
  Settings,
  LogOut,
  Target,
} from "lucide-react";
import type { Room } from "@/hooks/useRooms";

export type SidebarProps = {
  rooms: Room[];
  selectedRoomId: string | null;
  newRoomName: string;
  onNewRoomNameChange: (value: string) => void;
  onCreateRoom: () => Promise<Room | undefined>;
  onSelectRoom: (roomId: string) => void;
  onRenameRoom: (id: string, name: string) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
  onOpenSettings: () => void;
  onLogout: () => void;
};

export const Sidebar = ({
  rooms,
  selectedRoomId,
  newRoomName,
  onNewRoomNameChange,
  onCreateRoom,
  onSelectRoom,
  onRenameRoom,
  onDeleteRoom,
  onOpenSettings,
  onLogout,
}: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

  const handleCreateRoom = async () => {
    const room = await onCreateRoom();
    if (room?.id) {
      router.push(`/room/${room.id}`);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    onSelectRoom(roomId);
    router.push(`/room/${roomId}`);
  };

  const handleRenameStart = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };

  const handleRenameSubmit = (id: string) => {
    onRenameRoom(id, editingRoomName);
    setEditingRoomId(null);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[color:var(--bg-secondary)] border-r border-[color:var(--border-subtle)] flex flex-col h-screen sticky top-0 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-primary)]/40">
        <div
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="flex items-center gap-2">
            <div className="bg-[color:var(--accent-dim)] p-1.5 rounded text-[color:var(--accent)] border border-[color:var(--accent-glow)]">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-sm font-bold tracking-wider uppercase font-sans text-[color:var(--text-primary)] flex items-center gap-1">
              Meeting <span className="text-[color:var(--accent)]">Killer</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={newRoomName}
            onChange={(e) => onNewRoomNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateRoom();
            }}
            placeholder="NEW ROOM..."
            className="flex-1 bg-[color:var(--bg-primary)] border border-[color:var(--border-subtle)] rounded px-3 py-1.5 text-xs font-mono outline-none focus:border-[color:var(--accent)] text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
          />
          <button
            onClick={handleCreateRoom}
            className="bg-[color:var(--accent)] hover:bg-[color:var(--accent)]/80 text-black p-1.5 rounded transition-all font-mono active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[color:var(--bg-secondary)]/50">
        {rooms.map((room) => {
          const isActive =
            selectedRoomId === room.id ||
            pathname === `/room/${room.id}`;

          return (
            <div
              key={room.id}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded border transition-all cursor-pointer ${
                isActive
                  ? "bg-[color:var(--accent-dim)] border-[color:var(--accent-glow)] text-[color:var(--accent)] font-medium"
                  : "border-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-elevated)]/60 hover:text-[color:var(--text-primary)]"
              }`}
              onClick={() => handleSelectRoom(room.id)}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
              {editingRoomId === room.id ? (
                <input
                  autoFocus
                  className="flex-1 bg-[color:var(--bg-primary)] border border-[color:var(--border-active)] rounded px-1.5 py-0.5 text-xs font-mono outline-none text-[color:var(--text-primary)] min-w-0"
                  value={editingRoomName}
                  onChange={(e) => setEditingRoomName(e.target.value)}
                  onBlur={() => handleRenameSubmit(room.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit(room.id);
                    if (e.key === "Escape") setEditingRoomId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 text-xs font-mono truncate tracking-tight">
                  {room.name}
                </span>
              )}
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart(room);
                  }}
                  className="p-1 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] rounded transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoom(room.id);
                  }}
                  className="p-1 text-[color:var(--text-muted)] hover:text-[color:var(--danger)] rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
        {rooms.length === 0 && (
          <p className="text-[color:var(--text-muted)] text-[10px] font-mono text-center py-6">
            NO ACTIVE ROOMS
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-primary)]/40 flex items-center justify-between">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold text-[color:var(--text-secondary)] hover:text-[color:var(--accent)] hover:bg-[color:var(--accent-dim)] rounded transition-all flex-1"
        >
          <Settings className="w-4 h-4" />
          SETTINGS
        </button>
        <button
          onClick={onLogout}
          className="p-2 text-[color:var(--text-muted)] hover:text-[color:var(--danger)] hover:bg-red-500/10 rounded transition-all cursor-pointer ml-2"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
