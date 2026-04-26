import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { mysqlTable, serial, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const todos = mysqlTable('todos', {
  id: serial('id').primaryKey(),
  content: varchar('content', { length: 50 }).notNull(),
  completed: varchar('completed', { length: 10 }).default('false'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Todo = InferSelectModel<typeof todos>
export type NewTodo = InferInsertModel<typeof todos>
