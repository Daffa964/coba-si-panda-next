import { pgTable, serial, text, integer, timestamp, real, date, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the posyandu table
export const posyandu = pgTable('posyandu', {
  id: serial('id').primaryKey(),
  namaPosyandu: text('nama_posyandu').notNull(),
  lokasi: text('lokasi').notNull(), // e.g., "RW 01, Desa Kramat"
});

// Define the users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nama: text('nama').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().$type<'BIDAN' | 'KADER'>(), // Enum-like using TypeScript
  posyanduId: integer('posyandu_id').references(() => posyandu.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define the anak table
export const anak = pgTable('anak', {
  id: serial('id').primaryKey(),
  namaAnak: text('nama_anak').notNull(),
  jenisKelamin: text('jenis_kelamin').notNull().$type<'LAKI-LAKI' | 'PEREMPUAN'>(),
  tanggalLahir: date('tanggal_lahir').notNull(),
  namaWali: text('nama_wali').notNull(),
  teleponWali: text('telepon_wali'),
  posyanduId: integer('posyandu_id').notNull().references(() => posyandu.id),
  qrToken: text('qr_token').notNull().unique(), // For QR code generation
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define the pengukuran table
export const pengukuran = pgTable('pengukuran', {
  id: serial('id').primaryKey(),
  anakId: integer('anak_id').notNull().references(() => anak.id),
  tanggalPengukuran: date('tanggal_pengukuran').notNull(),
  beratBadanKg: real('berat_badan_kg').notNull(),
  tinggiBadanCm: real('tinggi_badan_cm').notNull(),
  zscoreBbU: real('zscore_bb_u'), // Z-score Weight for Age
  zscoreTbU: real('zscore_tb_u'), // Z-score Height for Age
  zscoreBbTb: real('zscore_bb_tb'), // Z-score Weight for Height
  statusGizi: text('status_gizi').notNull(), // Nutritional status classification
  dicatatOleh: integer('dicatat_oleh').notNull().references(() => users.id), // FK to users (the Kader who recorded)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relations between tables
export const posyanduRelations = relations(posyandu, ({ many }) => ({
  users: many(users),
  anak: many(anak),
}));

export const usersRelations = relations(users, ({ one }) => ({
  posyandu: one(posyandu, {
    fields: [users.posyanduId],
    references: [posyandu.id],
  }),
}));

export const anakRelations = relations(anak, ({ one, many }) => ({
  posyandu: one(posyandu, {
    fields: [anak.posyanduId],
    references: [posyandu.id],
  }),
  pengukuran: many(pengukuran),
}));

export const pengukuranRelations = relations(pengukuran, ({ one }) => ({
  anak: one(anak, {
    fields: [pengukuran.anakId],
    references: [anak.id],
  }),
  pencatat: one(users, {
    fields: [pengukuran.dicatatOleh],
    references: [users.id],
  }),
}));