DROP INDEX "certificates_cert_address_unique";--> statement-breakpoint
DROP INDEX "courses_course_name_unique";--> statement-breakpoint
DROP INDEX "issuer_email_unique";--> statement-breakpoint
DROP INDEX "issuer_institution_name_unique";--> statement-breakpoint
DROP INDEX "issuer_issuer_address_unique";--> statement-breakpoint
DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "students_full_name_unique";--> statement-breakpoint
DROP INDEX "students_email_unique";--> statement-breakpoint
DROP INDEX "students_student_address_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_address_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "role" TO "role" text;--> statement-breakpoint
CREATE UNIQUE INDEX `certificates_cert_address_unique` ON `certificates` (`cert_address`);--> statement-breakpoint
CREATE UNIQUE INDEX `courses_course_name_unique` ON `courses` (`course_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `issuer_email_unique` ON `issuer` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `issuer_institution_name_unique` ON `issuer` (`institution_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `issuer_issuer_address_unique` ON `issuer` (`issuer_address`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_full_name_unique` ON `students` (`full_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_email_unique` ON `students` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_student_address_unique` ON `students` (`student_address`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_address_unique` ON `users` (`address`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password`;