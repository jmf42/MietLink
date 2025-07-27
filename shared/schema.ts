import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("tenant"), // tenant, landlord, regie
  language: varchar("language").default("de"), // de, fr, it, en, es
  badgePaidAt: timestamp("badge_paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  slug: varchar("slug").unique().notNull(),
  address: text("address").notNull(),
  rentChf: decimal("rent_chf", { precision: 10, scale: 2 }).notNull(),
  noticeMonths: integer("notice_months").default(3),
  earliestExit: date("earliest_exit").notNull(),
  keyCount: integer("key_count").default(1),
  mainPhotoUrl: varchar("main_photo_url"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const links = pgTable("links", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  slug: varchar("slug").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  title: text("title").notNull(),
  dueDate: date("due_date"),
  mandatory: boolean("mandatory").default(true),
  status: varchar("status").default("pending"), // pending, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitSlots = pgTable("visit_slots", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  startsAt: timestamp("starts_at").notNull(),
  durationMin: integer("duration_min").default(30),
  capacity: integer("capacity").default(1),
  seatsLeft: integer("seats_left").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  userId: varchar("user_id").notNull().references(() => users.id),
  propertyId: varchar("property_id").references(() => properties.id),
  type: varchar("type").notNull(), // id, permit, debt_extract, income, lease
  url: varchar("url").notNull(),
  filename: varchar("filename"),
  isValid: boolean("is_valid").default(false),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  validationReason: text("validation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  userId: varchar("user_id").notNull().references(() => users.id),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  tenantScore: integer("tenant_score").default(0),
  status: varchar("status").default("dossier_submitted"), // see state machine in DDR
  landlordDecision: varchar("landlord_decision"), // accepted, rejected
  badgeFlag: boolean("badge_flag").default(false),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  userId: varchar("user_id").notNull().references(() => users.id),
  amountChf: decimal("amount_chf", { precision: 10, scale: 2 }).notNull(),
  stripeSessionId: varchar("stripe_session_id"),
  status: varchar("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  propertyId: varchar("property_id").references(() => properties.id),
  type: varchar("type").notNull(),
  payloadJson: jsonb("payload_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  documents: many(documents),
  candidates: many(candidates),
  payments: many(payments),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  links: many(links),
  tasks: many(tasks),
  visitSlots: many(visitSlots),
  candidates: many(candidates),
  events: many(events),
}));

export const candidatesRelations = relations(candidates, ({ one }) => ({
  user: one(users, {
    fields: [candidates.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [candidates.propertyId],
    references: [properties.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [documents.propertyId],
    references: [properties.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertVisitSlotSchema = createInsertSchema(visitSlots).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type VisitSlot = typeof visitSlots.$inferSelect;
export type InsertVisitSlot = z.infer<typeof insertVisitSlotSchema>;
export type Payment = typeof payments.$inferSelect;
export type Event = typeof events.$inferSelect;
