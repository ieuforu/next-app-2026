'use server'

import { db } from '@/db'
import { todos } from '@/db/schema'
import { createInsertSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import z from 'zod'

export type ActionState = {
  error: string | null
  success?: boolean
}

const insertTodoSchema = createInsertSchema(todos, {
  content: (s) => s.min(2, '内容至少需要 2 个字符').max(50, '内容不能超过 50 个字符'),
}).pick({ content: true })

export async function createTodo(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = insertTodoSchema.safeParse({
    content: formData.get('content'),
  })

  if (!validatedFields.success) {
    const treeError = z.treeifyError(validatedFields.error)
    return {
      error: treeError.properties?.content?.errors?.[0] ?? '输入无效',
      success: false,
    }
  }

  const { content } = validatedFields.data

  try {
    await db.insert(todos).values({ content })
    revalidatePath('/')
    return { error: null, success: true }
  } catch (e) {
    return { error: '数据库写入失败: ' + e, success: false }
  }
}

export async function clearAllTodos() {
  await db.delete(todos)
  revalidatePath('/')
}
