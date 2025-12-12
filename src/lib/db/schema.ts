import { 
  pgTable, serial, text, integer, timestamp, real, date 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------
// POSYANDU
// ---------------------
export const posyandu = pgTable('posyandu', {
  id: serial('id').primaryKey(),
  namaPosyandu: text('nama_posyandu').notNull(),
  lokasi: text('lokasi').notNull()
});

// ---------------------
// USERS (Lucia user table)
// ---------------------
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nama: text('nama').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().$type<'BIDAN' | 'KADER'>(),
  posyanduId: integer('posyandu_id')
    .references(() => posyandu.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------
// SESSIONS (HARUS SETELAH USERS)
// ---------------------
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // session ID by Lucia
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp('expires_at').notNull()
});

// ---------------------
// ANAK
// ---------------------
export const anak = pgTable('anak', {
  id: serial('id').primaryKey(),
  namaAnak: text('nama_anak').notNull(),
  jenisKelamin: text('jenis_kelamin')
    .notNull()
    .$type<'LAKI-LAKI' | 'PEREMPUAN'>(),
  tanggalLahir: date('tanggal_lahir').notNull(),
  namaWali: text('nama_wali').notNull(),
  teleponWali: text('telepon_wali'),
  posyanduId: integer('posyandu_id')
    .notNull()
    .references(() => posyandu.id),
  qrToken: text('qr_token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------
// PENGUKURAN
// ---------------------
export const pengukuran = pgTable('pengukuran', {
  id: serial('id').primaryKey(),
  anakId: integer('anak_id').notNull().references(() => anak.id),
  tanggalPengukuran: date('tanggal_pengukuran').notNull(),
  beratBadanKg: real('berat_badan_kg').notNull(),
  tinggiBadanCm: real('tinggi_badan_cm').notNull(),
  zscoreBbU: real('zscore_bb_u'),
  zscoreTbU: real('zscore_tb_u'),
  zscoreBbTb: real('zscore_bb_tb'),
  statusGizi: text('status_gizi').notNull(),
  dicatatOleh: integer('dicatat_oleh')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------
// RELATIONS
// ---------------------
export const posyanduRelations = relations(posyandu, ({ many }) => ({
  users: many(users),
  anak: many(anak)
}));

export const usersRelations = relations(users, ({ one }) => ({
  posyandu: one(posyandu, {
    fields: [users.posyanduId],
    references: [posyandu.id]
  })
}));

export const anakRelations = relations(anak, ({ one, many }) => ({
  posyandu: one(posyandu, {
    fields: [anak.posyanduId],
    references: [posyandu.id]
  }),
  pengukuran: many(pengukuran)
}));

export const pengukuranRelations = relations(pengukuran, ({ one }) => ({
  anak: one(anak, {
    fields: [pengukuran.anakId],
    references: [anak.id]
  }),
  pencatat: one(users, {
    fields: [pengukuran.dicatatOleh],
    references: [users.id]
  })
}));

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

