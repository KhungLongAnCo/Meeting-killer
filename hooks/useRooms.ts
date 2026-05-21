"use client";

import { useState, useEffect, useCallback } from "react";

export type Room = {
  id: string;
  name: string;
  createdAt: string;
  _count?: { sessions: number };
};

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState("");

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
      })
      .catch(console.error);
  }, []);

  const createRoom = useCallback(async () => {
    const name = newRoomName.trim();
    if (!name) return;
    setNewRoomName("");
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const room = await res.json();
      if (room.id) {
        setRooms((prev) => [room, ...prev]);
        return room;
      }
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  }, [newRoomName]);

  const selectRoom = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
  }, []);

  const renameRoom = useCallback(async (id: string, name: string) => {
    if (!name.trim()) {
      setEditingRoomId(null);
      return;
    }
    try {
      await fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: name.trim() } : r)),
      );
    } catch (err) {
      console.error("Failed to rename room:", err);
    }
    setEditingRoomId(null);
  }, []);

  const deleteRoom = useCallback(async (id: string) => {
    try {
      await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      setRooms((prev) => prev.filter((r) => r.id !== id));
      if (selectedRoomId === id) {
        setSelectedRoomId(null);
      }
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  }, [selectedRoomId]);

  return {
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    newRoomName,
    setNewRoomName,
    editingRoomId,
    setEditingRoomId,
    editingRoomName,
    setEditingRoomName,
    createRoom,
    selectRoom,
    renameRoom,
    deleteRoom,
  };
}
