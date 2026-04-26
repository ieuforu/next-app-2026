import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

const app = new Hono().basePath('/api')

const route = app
  .get('/todos', async (c) => {
    const result = await db.select().from(todos).orderBy(desc(todos.id))
    return c.json(result)
  })

  .post('/todos', async (c) => {
    const { content } = await c.req.json()
    if (!content) return c.json({ error: '内容不能为空' }, 400)
    await db.insert(todos).values({ content })
    return c.json({ success: true }, 201)
  })

  .patch('/todos/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const { completed } = await c.req.json()

    const isCompleted = completed === true || completed === 1 || completed === 'true'

    await db.update(todos).set({ completed: isCompleted }).where(eq(todos.id, id))

    return c.json({ success: true })
  })

  .delete('/todos/:id', async (c) => {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400)

    await db.delete(todos).where(eq(todos.id, id))
    return c.json({ success: true })
  })

  .post('/todos/clear-completed', async (c) => {
    await db.delete(todos).where(eq(todos.completed, true))
    return c.json({ success: true })
  })

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof route
