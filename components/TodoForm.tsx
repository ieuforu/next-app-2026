'use client'

import { useActionState, useEffect, useOptimistic, useRef, useTransition } from 'react'
import { clearAllTodos, createTodo, type ActionState } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Trash2Icon } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import type { Todo } from '@/db/schema'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button className="w-24 h-12" type="submit" disabled={pending}>
      <span className="flex items-center justify-center w-full">{pending ? '添加中' : '添加'}</span>
    </Button>
  )
}

export function TodoForm({ initialTodos }: { initialTodos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const initialState: ActionState = { error: null, success: false }

  const [state, formAction, _] = useActionState(createTodo, initialState)

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    }
    if (state.success) {
      toast('任务添加成功！')
    }
  }, [state])

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTodoContent: string) => [
      { id: Date.now(), content: newTodoContent, completed: 'false', createdAt: new Date() },
      ...state,
    ],
  )

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get('content') as string
    if (!content) return
    if (content.length < 2) {
      toast.warning('起码写两个字吧？')
      return
    }
    addOptimisticTodo(content)

    formRef.current?.reset()

    await formAction(formData)
  }

  const [isPendingClear, startTransition] = useTransition()

  const handleClear = () => {
    startTransition(async () => {
      await clearAllTodos()
    })
  }

  return (
    <div>
      <form ref={formRef} action={handleSubmit} className="flex gap-2 mb-8 items-start">
        <input
          name="content"
          autoComplete="off"
          className="flex-1 h-12 px-4 rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="添加任务..."
        />
        <div className="flex gap-4 shrink-0">
          <SubmitButton />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="w-24 h-12"
                variant="destructive"
                disabled={isPendingClear}
              >
                <span className="flex items-center justify-center w-full">
                  {isPendingClear ? '清空中...' : '清空'}
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>确定要清空吗？</AlertDialogTitle>
                <AlertDialogDescription>此操作不可撤销</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">取消</AlertDialogCancel>

                <AlertDialogCancel variant="destructive" onClick={handleClear}>
                  确定
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>

      <ul className="space-y-3">
        {optimisticTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            <p>还没有任务，喝杯咖啡吧 ☕️</p>
          </div>
        ) : (
          optimisticTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex h-18 items-center justify-between p-4 rounded-xl border bg-card shadow-sm transition-all duration-200"
            >
              <span className="truncate mr-4">{todo.content}</span>
              <Button variant="outline" size="sm" className="w-15 shrink-0" disabled>
                <span className="flex items-center justify-center w-full">
                  {todo.id.toString().startsWith('temp-') ? '同步中' : '待办'}
                </span>
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
