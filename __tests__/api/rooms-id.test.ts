import { describe, it, expect, vi } from 'vitest';
import { GET, PATCH, DELETE } from '@/app/api/rooms/[id]/route';
import { prismaMock } from '@/lib/__mocks__/prisma';

describe('Rooms [id] API (/api/rooms/[id])', () => {
  const params = Promise.resolve({ id: '1' });

  describe('GET', () => {
    it('returns a room if found', async () => {
      const mockRoom = { id: '1', name: 'Room 1', createdAt: new Date(), updatedAt: new Date(), sessions: [] };
      prismaMock.room.findUnique.mockResolvedValue(mockRoom);

      const res = await GET(new Request('http://localhost'), { params });
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data).toEqual(mockRoom);
    });

    it('returns 404 if not found', async () => {
      prismaMock.room.findUnique.mockResolvedValue(null);

      const res = await GET(new Request('http://localhost'), { params });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('Room not found');
    });
  });

  describe('PATCH', () => {
    it('updates room name', async () => {
      const mockRoom = { id: '1', name: 'Updated Room', createdAt: new Date(), updatedAt: new Date() };
      prismaMock.room.update.mockResolvedValue(mockRoom);

      const req = new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Room' })
      });

      const res = await PATCH(req, { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockRoom);
    });

    it('returns 400 if name is missing', async () => {
      const req = new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({ name: '' })
      });

      const res = await PATCH(req, { params });
      const data = await res.json();

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('deletes the room', async () => {
      prismaMock.room.delete.mockResolvedValue({} as any);

      const res = await DELETE(new Request('http://localhost'), { params });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(prismaMock.room.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
