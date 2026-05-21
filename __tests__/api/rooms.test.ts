import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from '@/app/api/rooms/route';
import { prismaMock } from '@/lib/__mocks__/prisma';

describe('Rooms API (/api/rooms)', () => {
  describe('GET', () => {
    it('returns a list of rooms', async () => {
      const mockRooms = [
        { id: '1', name: 'Room 1', createdAt: new Date(), updatedAt: new Date(), _count: { sessions: 0 }, sessions: [] }
      ];
      prismaMock.room.findMany.mockResolvedValue(mockRooms);

      const res = await GET();
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data).toEqual(mockRooms);
      expect(prismaMock.room.findMany).toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      prismaMock.room.findMany.mockRejectedValue(new Error('DB Error'));

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('Failed to fetch rooms');
    });
  });

  describe('POST', () => {
    it('creates a new room', async () => {
      const mockRoom = { id: '2', name: 'New Room', createdAt: new Date(), updatedAt: new Date() };
      prismaMock.room.create.mockResolvedValue(mockRoom);

      const req = new Request('http://localhost/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Room' })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockRoom);
      expect(prismaMock.room.create).toHaveBeenCalledWith({
        data: { name: 'New Room' }
      });
    });

    it('returns 400 if name is missing', async () => {
      const req = new Request('http://localhost/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: '   ' })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Room name is required');
    });
  });
});
