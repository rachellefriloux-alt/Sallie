/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User identity management and authentication.
 * Got it, love.
 */

export class IdentityManager {
    constructor() {
        this.users = new Map();
        this.currentUser = null;
    }

    registerUser(userId, profile) {
        if (this.users.has(userId)) throw new Error('User already exists');
        this.users.set(userId, profile);
    }

    authenticate(userId) {
        if (!this.users.has(userId)) throw new Error('User not found');
        this.currentUser = this.users.get(userId);
        return true;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}
