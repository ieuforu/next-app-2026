import { db } from '@/db'
import { todos } from '@/db/schema'
import { TodoForm } from '@/components/TodoForm'
import { desc } from 'drizzle-orm'
import { Suspense } from 'react'

export default async function Page() {
  const allTodos = await db.select().from(todos).orderBy(desc(todos.id))
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">2026 Todo List</h1>

      <Suspense fallback={<div className="h-100 w-full" />}>
        <TodoForm initialTodos={allTodos} />
      </Suspense>
    </div>
  )
}
