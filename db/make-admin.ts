import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const email = process.argv[2];

if (!email) {
  console.log("Usage: npx tsx db/make-admin.ts <email>");
  process.exit(1);
}

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  const result = await db
    .update(schema.user)
    .set({ role: "admin" })
    .where(eq(schema.user.email, email))
    .returning();

  if (result.length === 0) {
    console.log(`User with email "${email}" not found.`);
  } else {
    console.log(`User "${result[0].name}" (${email}) is now an admin!`);
  }

  await client.end();
}

main().catch(console.error);
