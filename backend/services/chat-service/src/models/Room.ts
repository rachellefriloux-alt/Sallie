import db from '../database/connection';

export interface Room {
  id?: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  created_by: string;
  members: string[];
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export class RoomModel {
  static async create(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const [createdRoom] = await db('rooms')
      .insert({
        ...room,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    
    return createdRoom;
  }

  static async findById(id: string): Promise<Room | null> {
    const room = await db('rooms').where({ id }).first();
    return room || null;
  }

  static async findByUserId(userId: string): Promise<Room[]> {
    return await db('rooms')
      .whereRaw('?', [userId]) // This would need to be adjusted based on your JSON handling
      .orderBy('updated_at', 'desc');
  }

  static async update(id: string, updates: Partial<Room>): Promise<Room | null> {
    const [updatedRoom] = await db('rooms')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');
    
    return updatedRoom || null;
  }

  static async addMember(roomId: string, userId: string): Promise<boolean> {
    // This would need to be adjusted based on your JSON handling
    const result = await db('rooms')
      .where({ id: roomId })
      .update({
        updated_at: new Date(),
      });
    
    return result > 0;
  }

  static async removeMember(roomId: string, userId: string): Promise<boolean> {
    // This would need to be adjusted based on your JSON handling
    const result = await db('rooms')
      .where({ id: roomId })
      .update({
        updated_at: new Date(),
      });
    
    return result > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const deletedCount = await db('rooms').where({ id }).del();
    return deletedCount > 0;
  }

  static async getRoomStats(roomId: string): Promise<any> {
    const stats = await db('messages')
      .where({ room_id: roomId })
      .select(
        db.raw('COUNT(*) as message_count'),
        db.raw('COUNT(DISTINCT user_id) as unique_users'),
        db.raw('MAX(created_at) as last_message_at')
      )
      .first();
    
    return stats;
  }
}
