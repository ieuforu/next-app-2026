import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

const globalForDb = global as unknown as { connection: mysql.Connection | undefined }

const connection =
  globalForDb.connection ?? (await mysql.createConnection(process.env.DATABASE_URL!))

if (process.env.NODE_ENV !== 'production') globalForDb.connection = connection

export const db = drizzle(connection, { schema, mode: 'default' })
