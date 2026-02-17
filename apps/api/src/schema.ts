import {
  pgTable,
  serial,
  text,
  timestamp,
  integer
} from "drizzle-orm/pg-core";

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => creators.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id")
    .notNull()
    .references(() => forms.id),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  quote: text("quote").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at")
});
