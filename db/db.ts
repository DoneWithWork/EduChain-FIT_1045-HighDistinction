import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema1 from "./schema"
config({ path: '.env' });
export const db = drizzle({
    schema: schema1,
    connection: {
        url: process.env.TURSO_CONNECTION_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    }
});
