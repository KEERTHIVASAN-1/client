import { type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

interface LegacyUser {
  id: string;
  username: string;
  password: string;
}

export interface IStorage {
  getUser(id: string): Promise<LegacyUser | undefined>;
  getUserByUsername(username: string): Promise<LegacyUser | undefined>;
  createUser(user: InsertUser): Promise<LegacyUser>;
}

export class MemStorage implements IStorage {
  private users: Map<string, LegacyUser>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<LegacyUser | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<LegacyUser | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<LegacyUser> {
    const id = randomUUID();
    const user: LegacyUser = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
