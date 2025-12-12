import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"; // Pastikan import ini benar
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

// PENTING: Tambahkan 'as any' untuk melewati error ketidakcocokan versi tipe data Drizzle
const adapter = new DrizzlePostgreSQLAdapter(db, sessions as any, users as any);

export const auth = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes: (attributes) => {
		return {
			nama: attributes.nama,
			email: attributes.email,
			role: attributes.role,
			posyanduId: attributes.posyanduId
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof auth;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	nama: string;
	email: string;
	role: 'BIDAN' | 'KADER';
	posyanduId: number | null;
}