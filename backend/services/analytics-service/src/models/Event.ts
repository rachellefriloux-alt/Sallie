import db from '../database/connection';

export interface Event {
  id?: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: Date;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

export class EventModel {
  static async create(event: Omit<Event, 'id'>): Promise<Event> {
    const [createdEvent] = await db('events')
      .insert({
        ...event,
        timestamp: new Date(),
      })
      .returning('*');
    
    return createdEvent;
  }

  static async findById(id: string): Promise<Event | null> {
    const event = await db('events').where({ id }).first();
    return event || null;
  }

  static async findByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<Event[]> {
    return await db('events')
      .where({ user_id: userId })
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async findByEventType(eventType: string, limit: number = 100, offset: number = 0): Promise<Event[]> {
    return await db('events')
      .where({ event_type: eventType })
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async getEventStats(userId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    let query = db('events');
    
    if (userId) {
      query = query.where('user_id', userId);
    }
    
    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }
    
    const stats = await query
      .select(
        'event_type',
        db.raw('COUNT(*) as count'),
        db.raw('MIN(timestamp) as first_occurrence'),
        db.raw('MAX(timestamp) as last_occurrence')
      )
      .groupBy('event_type');
    
    return stats;
  }

  static async delete(id: string): Promise<boolean> {
    const deletedCount = await db('events').where({ id }).del();
    return deletedCount > 0;
  }

  static async deleteByUserId(userId: string): Promise<number> {
    return await db('events').where({ user_id: userId }).del();
  }
}
