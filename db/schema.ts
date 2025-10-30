import { InferInsertModel, InferSelectModel, relations, sql } from 'drizzle-orm';
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
    onBoardingCompleted: integer('onboarding_completed').notNull().default(0),
    stripeCustomerId: text('stripe_customer_id').unique(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text('deleted_at'),
});
export const subscription = sqliteTable('subscriptions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    plan: text('plan', { enum: ['free', 'pro', 'power'] }).notNull().default('free'),
    stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
    status: text('status').notNull(),
    currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const subscriptionRelations = relations(subscription, ({ one }) => ({
    user: one(users, {
        fields: [subscription.userId],
        references: [users.id],
    }),
}));

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
    courseId: integer('course_id')
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    studentEmail: text('student_email').notNull(),
    certAddress: text('cert_address').unique(),
    objectId: text('object_id').default(""),
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


export const userRelations = relations(users, ({ one, many }) => ({
    sessions: many(sessions),
    subscription: one(subscription, {
        fields: [users.id],
        references: [subscription.userId],
    }),
}));
// Each session belongs to one user
export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
    issuer: one(users, {
        fields: [courses.issuerId],
        references: [users.id],
    }),
    certificates: many(certificates),
}));
export const certificateRelations = relations(certificates, ({ one }) => ({
    issuer: one(users, {
        fields: [certificates.issuerId],
        references: [users.id],
    }),
    student: one(users, {
        fields: [certificates.studentId],
        references: [users.id],
    }),
    courses: one(courses, {
        fields: [certificates.courseId],
        references: [courses.id],
    }),
}));
export type Certificate = InferSelectModel<typeof certificates>
export type Course = InferSelectModel<typeof courses>;
export type NewCourse = InferInsertModel<typeof courses>;
