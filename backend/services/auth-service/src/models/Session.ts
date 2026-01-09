import { v4 as uuidv4 } from 'uuid';
import { knex } from '../database/connection';

export interface Session {
  id: string;
  userId: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
  createdAt: Date;
  lastAccessAt: Date;
  expiresAt?: Date;
}

export interface CreateSessionData {
  userId: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
}

export class SessionModel {
  static async create(sessionData: CreateSessionData): Promise<Session> {
    const session = {
      id: uuidv4(),
      userId: sessionData.userId,
      token: sessionData.token,
      userAgent: sessionData.userAgent || null,
      ipAddress: sessionData.ipAddress || null,
      isActive: true,
      createdAt: new Date(),
      lastAccessAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    const [createdSession] = await knex('sessions').insert(session).returning('*');
    return createdSession;
  }

  static async findById(id: string): Promise<Session | null> {
    const session = await knex('sessions').where({ id }).first();
    return session || null;
  }

  static async findByToken(token: string): Promise<Session | null> {
    const session = await knex('sessions').where({ token }).first();
    return session || null;
  }

  static async findByUserId(userId: string): Promise<Session[]> {
    return await knex('sessions').where({ userId }).orderBy('createdAt', 'desc');
  }

  static async updateLastAccess(id: string): Promise<void> {
    await knex('sessions')
      .where({ id })
      .update({
        lastAccessAt: new Date(),
      });
  }

  static async updateToken(id: string, newToken: string): Promise<void> {
    await knex('sessions')
      .where({ id })
      .update({
        token: newToken,
        lastAccessAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reset expiration
      });
  }

  static async revoke(id: string): Promise<void> {
    await knex('sessions')
      .where({ id })
      .update({
        isActive: false,
        updatedAt: new Date(),
      });
  }

  static async invalidateByToken(token: string): Promise<void> {
    await knex('sessions')
      .where({ token })
      .update({
        isActive: false,
        updatedAt: new Date(),
      });
  }

  static async invalidateByUserId(userId: string): Promise<void> {
    await knex('sessions')
      .where({ userId })
      .update({
        isActive: false,
        updatedAt: new Date(),
      });
  }

  static async revokeAllExceptCurrent(userId: string, currentToken: string): Promise<number> {
    const result = await knex('sessions')
      .where({ userId })
      .where('token', '!=', currentToken)
      .where('isActive', true)
      .update({
        isActive: false,
        updatedAt: new Date(),
      });

    return result;
  }

  static async revokeByUserId(userId: string): Promise<number> {
    const result = await knex('sessions')
      .where({ userId })
      .where('isActive', true)
      .update({
        isActive: false,
        updatedAt: new Date(),
      });

    return result;
  }

  static async cleanupExpired(): Promise<number> {
    const result = await knex('sessions')
      .where('expiresAt', '<', new Date())
      .orWhere('isActive', false)
      .del();

    return result;
  }

  static async getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    lastAccessAt?: Date;
    devices: Array<{
      userAgent: string;
      ipAddress: string;
      lastAccessAt: Date;
    }>;
  }> {
    const sessions = await knex('sessions')
      .where({ userId })
      .orderBy('lastAccessAt', 'desc');

    const activeSessions = sessions.filter(s => s.isActive);
    const devices = activeSessions.map(session => ({
      userAgent: session.userAgent || 'Unknown',
      ipAddress: session.ipAddress || 'Unknown',
      lastAccessAt: session.lastAccessAt,
    }));

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      lastAccessAt: sessions[0]?.lastAccessAt,
      devices,
    };
  }

  static async getActiveSessionCount(): Promise<number> {
    const result = await knex('sessions')
      .where('isActive', true)
      .where('expiresAt', '>', new Date())
      .count('* as count')
      .first();

    return parseInt(result?.count || '0');
  }

  static async list(limit: number = 50, offset: number = 0): Promise<Session[]> {
    return await knex('sessions')
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc');
  }

  static async count(): Promise<number> {
    const result = await knex('sessions').count('* as count').first();
    return parseInt(result?.count || '0');
  }
}

export const Session = SessionModel;
