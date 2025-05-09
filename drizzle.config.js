import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema:'./utils/schema.js',
    dialect: "postgresql",
    dbCredentials: {
        url: 'postgresql://neondb_owner:npg_o7EWheZ3LxHF@ep-silent-queen-a8j0nxxr-pooler.eastus2.azure.neon.tech/ai-interview?sslmode=require',
    }
})
