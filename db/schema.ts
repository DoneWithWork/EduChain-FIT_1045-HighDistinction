import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// === schema_migrations ===
export const schemaMigrations = sqliteTable('schema_migrations', {
    id: text('id').notNull().primaryKey(),
});

// === users ===
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    fullName: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    role: text('role', { enum: ['student', 'issuer', 'admin'] }),
    address: text('address').notNull().unique(),
    institutionName: text('institution_name'),
    studentId: text('student_id'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
});

// === courses ===
export const courses = sqliteTable('courses', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    courseName: text('course_name').notNull().unique(),
    courseDescription: text('course_description').notNull(),
    issuerId: integer('issuer_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
    courseImageUrl: text('course_image_url').notNull().default(''),
    studentEmails: text('student_emails').notNull().default('[""]'),
});

// === certificates ===
export const certificates = sqliteTable('certificates', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    issuerId: integer('issuer_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    studentId: integer('student_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    studentEmail: text('student_email').notNull(),
    certAddress: text('cert_address').notNull().unique(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    revoked: integer('revoked').notNull().default(0),
});

// === sessions ===
export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// === students ===
export const students = sqliteTable('students', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    fullName: text('full_name').notNull().unique(),
    email: text('email').notNull().unique(),
    studentAddress: text('student_address').notNull().unique(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
    role: text('role', { enum: ['student', 'admin', 'issuer'] })
        .notNull()
        .default('student'),
});

// === issuer ===
export const issuer = sqliteTable('issuer', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    institutionName: text('institution_name').notNull().unique(),
    issuerAddress: text('issuer_address').notNull().unique(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
    role: text('role', { enum: ['student', 'admin', 'issuer'] })
        .notNull()
        .default('issuer'),
});

// === certs ===
export const certs = sqliteTable('certs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    mintedAt: text('minted_at').default(sql`CURRENT_TIMESTAMP`),
    certHash: text('cert_hash'),
    studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
});
export const userRelations = relations(users, ({ many }) => ({
    sessions: many(sessions),
}));

// Each session belongs to one user
export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));