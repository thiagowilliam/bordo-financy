ALTER TABLE "categories" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- The shared default categories (user_id null) become one copy per user, keeping what the user hid,
-- and the user's expenses are pointed at their copy.
CREATE TEMP TABLE "category_copies" AS
  SELECT c."id" AS "old_id", u."id" AS "user_id", uuidv7() AS "new_id"
  FROM "categories" c CROSS JOIN "users" u
  WHERE c."user_id" IS NULL
  ORDER BY c."created_at", c."id";--> statement-breakpoint
INSERT INTO "categories" ("id", "user_id", "name", "icon", "color", "kind", "is_default", "hidden", "created_at")
  SELECT m."new_id", m."user_id", c."name", c."icon", c."color", c."kind", true,
    EXISTS (SELECT 1 FROM "hidden_categories" h WHERE h."user_id" = m."user_id" AND h."category_id" = m."old_id"),
    c."created_at"
  FROM "category_copies" m JOIN "categories" c ON c."id" = m."old_id";--> statement-breakpoint
UPDATE "expenses" e SET "category_id" = m."new_id"
  FROM "category_copies" m, "trips" t
  WHERE e."category_id" = m."old_id" AND t."id" = e."trip_id" AND t."user_id" = m."user_id";--> statement-breakpoint
DROP TABLE "category_copies";--> statement-breakpoint
DELETE FROM "categories" WHERE "user_id" IS NULL;--> statement-breakpoint
DROP TABLE "hidden_categories" CASCADE;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "user_id" SET NOT NULL;
