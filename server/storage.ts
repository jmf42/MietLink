import {
  users,
  properties,
  candidates,
  documents,
  tasks,
  visitSlots,
  payments,
  events,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Candidate,
  type InsertCandidate,
  type Document,
  type InsertDocument,
  type Task,
  type InsertTask,
  type VisitSlot,
  type InsertVisitSlot,
  type Payment,
  type Event,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Property operations
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  getPropertiesByOwner(ownerId: string): Promise<Property[]>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property>;
  
  // Candidate operations
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  getCandidatesByProperty(propertyId: string): Promise<Candidate[]>;
  updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate>;
  getCandidateByUserAndProperty(userId: string, propertyId: string): Promise<Candidate | undefined>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByUser(userId: string): Promise<Document[]>;
  getDocumentsByCandidate(userId: string, propertyId: string): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTasksByProperty(propertyId: string): Promise<Task[]>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;
  
  // Visit slot operations
  createVisitSlot(slot: InsertVisitSlot): Promise<VisitSlot>;
  getVisitSlotsByProperty(propertyId: string): Promise<VisitSlot[]>;
  updateVisitSlot(id: string, updates: Partial<InsertVisitSlot>): Promise<VisitSlot>;
  
  // Payment operations
  createPayment(payment: Partial<Payment>): Promise<Payment>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.slug, slug));
    return property;
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId)).orderBy(desc(properties.createdAt));
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property> {
    const [property] = await db.update(properties).set(updates).where(eq(properties.id, id)).returning();
    return property;
  }

  // Candidate operations
  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async getCandidatesByProperty(propertyId: string): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.propertyId, propertyId)).orderBy(desc(candidates.tenantScore));
  }

  async updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate> {
    const [candidate] = await db.update(candidates).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(candidates.id, id)).returning();
    return candidate;
  }

  async getCandidateByUserAndProperty(userId: string, propertyId: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(
      and(eq(candidates.userId, userId), eq(candidates.propertyId, propertyId))
    );
    return candidate;
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByCandidate(userId: string, propertyId: string): Promise<Document[]> {
    return await db.select().from(documents).where(
      and(eq(documents.userId, userId), eq(documents.propertyId, propertyId))
    ).orderBy(desc(documents.createdAt));
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [document] = await db.update(documents).set(updates).where(eq(documents.id, id)).returning();
    return document;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTasksByProperty(propertyId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.propertyId, propertyId)).orderBy(asc(tasks.dueDate));
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task;
  }

  // Visit slot operations
  async createVisitSlot(slot: InsertVisitSlot): Promise<VisitSlot> {
    const [newSlot] = await db.insert(visitSlots).values(slot).returning();
    return newSlot;
  }

  async getVisitSlotsByProperty(propertyId: string): Promise<VisitSlot[]> {
    return await db.select().from(visitSlots).where(eq(visitSlots.propertyId, propertyId)).orderBy(asc(visitSlots.startsAt));
  }

  async updateVisitSlot(id: string, updates: Partial<InsertVisitSlot>): Promise<VisitSlot> {
    const [slot] = await db.update(visitSlots).set(updates).where(eq(visitSlots.id, id)).returning();
    return slot;
  }

  // Payment operations
  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment as any).returning();
    return newPayment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();
