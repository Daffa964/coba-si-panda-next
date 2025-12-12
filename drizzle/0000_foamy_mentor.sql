CREATE TABLE IF NOT EXISTS "anak" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_anak" text NOT NULL,
	"jenis_kelamin" text NOT NULL,
	"tanggal_lahir" date NOT NULL,
	"nama_wali" text NOT NULL,
	"telepon_wali" text,
	"posyandu_id" integer NOT NULL,
	"qr_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "anak_qr_token_unique" UNIQUE("qr_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pengukuran" (
	"id" serial PRIMARY KEY NOT NULL,
	"anak_id" integer NOT NULL,
	"tanggal_pengukuran" date NOT NULL,
	"berat_badan_kg" real NOT NULL,
	"tinggi_badan_cm" real NOT NULL,
	"zscore_bb_u" real,
	"zscore_tb_u" real,
	"zscore_bb_tb" real,
	"status_gizi" text NOT NULL,
	"dicatat_oleh" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posyandu" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_posyandu" text NOT NULL,
	"lokasi" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"posyandu_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anak" ADD CONSTRAINT "anak_posyandu_id_posyandu_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandu"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pengukuran" ADD CONSTRAINT "pengukuran_anak_id_anak_id_fk" FOREIGN KEY ("anak_id") REFERENCES "public"."anak"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pengukuran" ADD CONSTRAINT "pengukuran_dicatat_oleh_users_id_fk" FOREIGN KEY ("dicatat_oleh") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_posyandu_id_posyandu_id_fk" FOREIGN KEY ("posyandu_id") REFERENCES "public"."posyandu"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
