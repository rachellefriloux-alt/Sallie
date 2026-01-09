import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { knex } from '../database/connection';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences?: Record<string, any>;
  mfaSecret?: string;
  mfaEnabled?: boolean;
  backupCodes?: string[];
  isActive: boolean;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const user = {
      id: uuidv4(),
      email: userData.email.toLowerCase(),
      password: userData.password,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      avatar: userData.avatar || null,
      preferences: userData.preferences || {},
      mfaSecret: null,
      mfaEnabled: false,
      backupCodes: [],
      isActive: true,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdUser] = await knex('users').insert(user).returning('*');
    return createdUser;
  }

  static async findById(id: string): Promise<User | null> {
    const user = await knex('users').where({ id }).first();
    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await knex('users').where({ email: email.toLowerCase() }).first();
    return user || null;
  }

  static async update(id: string, updateData: UpdateUserData): Promise<User> {
    const updateFields = {
      ...updateData,
      updatedAt: new Date(),
    };

    const [updatedUser] = await knex('users')
      .where({ id })
      .update(updateFields)
      .returning('*');

    return updatedUser;
  }

  static async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await knex('users')
      .where({ id })
      .update({
        password: hashedPassword,
        updatedAt: new Date(),
      });
  }

  static async updateMFASecret(id: string, secret: string): Promise<void> {
    await knex('users')
      .where({ id })
      .update({
        mfaSecret: secret,
        updatedAt: new Date(),
      });
  }

  static async enableMFA(id: string): Promise<void> {
    await knex('users')
      .where({ id })
      .update({
        mfaEnabled: true,
        updatedAt: new Date(),
      });
  }

  static async disableMFA(id: string): Promise<void> {
    await knex('users')
      .where({ id })
      .update({
        mfaSecret: null,
        mfaEnabled: false,
        backupCodes: [],
        updatedAt: new Date(),
      });
  }

  static async updateBackupCodes(id: string, hashedCodes: string[]): Promise<void> {
    await knex('users')
      .where({ id })
      .update({
        backupCodes: JSON.stringify(hashedCodes),
        updatedAt: new Date(),
      });
  }

  static async verifyBackupCode(id: string, code: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user || !user.backupCodes || user.backupCodes.length === 0) {
      return false;
    }

    const backupCodes = typeof user.backupCodes === 'string' 
      ? JSON.parse(user.backupCodes) 
      : user.backupCodes;

    // Find matching backup code
    let codeIndex = -1;
    for (let i = 0; i < backupCodes.length; i++) {
      const isValid = await bcrypt.compare(code, backupCodes[i]);
      if (isValid) {
        codeIndex = i;
        break;
      }
    }

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    await this.updateBackupCodes(id, backupCodes);

    return true;
  }

  static async delete(id: string): Promise<void> {
    await knex('users').where({ id }).del();
  }

  static async deactivate(id: string): Promise<void> {
    await knex('users')
      .where({ id })
      .update({
        isActive: false,
        updatedAt: new Date(),
      });
  }

  static async activate(id: string): Promise<void> {
    await knex('users')
      .where({ id })
      .update({
        isActive: true,
        updatedAt: new Date(),
      });
  }

  static async list(limit: number = 50, offset: number = 0): Promise<User[]> {
    return await knex('users')
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc');
  }

  static async count(): Promise<number> {
    const result = await knex('users').count('* as count').first();
    return parseInt(result?.count || '0');
  }

  static async search(query: string, limit: number = 20): Promise<User[]> {
    return await knex('users')
      .where('email', 'ilike', `%${query}%`)
      .orWhere('firstName', 'ilike', `%${query}%`)
      .orWhere('lastName', 'ilike', `%${query}%`)
      .limit(limit)
      .orderBy('createdAt', 'desc');
  }
}

export const User = UserModel;
