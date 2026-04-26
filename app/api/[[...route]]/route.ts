import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { desc } from 'drizzle-orm'

const app = new Hono().basePath('/api')

const route = app
  .get('/todos', async (c) => {
    const result = await db.select().from(todos).orderBy(desc(todos.id))
    return c.json(result)
  })

  .post('/todos', async (c) => {
    const { content } = await c.req.json()
    if (!content) return c.json({ error: 'content is required' }, 400)

    await db.insert(todos).values({ content })
    return c.json({ success: true }, 201)
  })

export const GET = handle(app)
export const POST = handle(app)
export type AppType = typeof route
