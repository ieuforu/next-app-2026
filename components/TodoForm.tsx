'use client'

import { useActionState, useEffect, useOptimistic, useRef, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  createTodo,
  type ActionState,
  toggleTodoAction,
  deleteTodoAction,
  clearCompletedAction,
} from '@/app/actions'
import { Button } from '@/components/ui/button'

import { toast } from 'sonner'
import { Trash2, CheckCircle2, Circle, Eraser } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import type { Todo } from '@/db/schema'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending} variant="ghost" className="hover:bg-gray-100 hover:cursor-pointer">
      Push
    </Button>
  )
}

export function TodoForm({ initialTodos }: { initialTodos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const initialState: ActionState = { error: null, success: false }

  const [state, formAction] = useActionState(createTodo, initialState)

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    }
    if (state.success) {
      toast.success('已添加任务')
    }
  }, [state])

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, { action, payload }) => {
      switch (action) {
        case 'add':
          return [
            { id: payload.id, content: payload.content, completed: false, createdAt: new Date() },
            ...state,
          ]
        case 'toggle':
          return state.map((t) => (t.id === payload.id ? { ...t, completed: !t.completed } : t))
        case 'delete':
          return state.filter((t) => t.id !== payload.id)
        case 'clear-completed':
          return state.filter((t) => !t.completed)
        default:
          return state
      }
    },
  )

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get('content') as string
    if (!content.trim()) return
    if (content.length < 2) {
      toast.warning('起码写两个字吧？')
      return
    }
    const tempId = `temp-${Date.now()}`
    addOptimisticTodo({ action: 'add', payload: { content, id: tempId } })
    formRef.current?.reset()
    await formAction(formData)
  }

  const [_, startTransition] = useTransition()

  const handleToggle = (id: number, completed: boolean) => {
    startTransition(async () => {
      addOptimisticTodo({ action: 'toggle', payload: { id } })
      await toggleTodoAction(id, !completed)
    })
  }

  const handleDelete = (id: number) => {
    startTransition(async () => {
      addOptimisticTodo({ action: 'delete', payload: { id } })
      await deleteTodoAction(id)
      toast.error('任务已删除')
    })
  }

  const handleClearCompleted = () => {
    startTransition(async () => {
      addOptimisticTodo({ action: 'clear-completed', payload: null })
      await clearCompletedAction()
      toast.info('已清理所有完成项')
    })
  }

  const completedCount = optimisticTodos.filter((t) => t.completed).length

  return (
    <div className="flex flex-col min-h-100">
      <div className="h-20 flex items-center bg-background/50 sticky top-0 z-10 backdrop-blur-sm">
        <form ref={formRef} action={handleSubmit} className="flex gap-4 w-full items-center">
          <input
            name="content"
            autoComplete="off"
            placeholder="有什么新计划？"
            className="flex-1 bg-transparent border-b border-zinc-800 focus:border-zinc-500 outline-none px-1 py-2 text-lg transition-all placeholder:text-zinc-700"
          />
          <SubmitButton />
        </form>
      </div>

      <div className="flex-1 py-4">
        <ul className="relative divide-y divide-zinc-900/50">
          <AnimatePresence mode="popLayout" initial={false}>
            {optimisticTodos.map((todo) => (
              <motion.li
                key={todo.content}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 40,
                  opacity: { duration: 0.2 },
                }}
                className="flex items-center justify-between group py-4 px-1 bg-background"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => handleToggle(todo.id, !!todo.completed)}>
                    <motion.div
                      initial={false}
                      animate={{ scale: todo.completed ? [1, 1.2, 1] : 1 }}
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-zinc-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" />
                      )}
                    </motion.div>
                  </button>
                  <span
                    className={`text-base transition-all duration-500 ${
                      todo.completed ? 'line-through text-zinc-600' : 'text-zinc-200'
                    }`}
                  >
                    {todo.content}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-900 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <div className="h-12 flex items-center justify-between border-t border-zinc-900 text-[10px] uppercase tracking-widest text-zinc-600 px-1 mt-auto">
        <div>{optimisticTodos.length} items total</div>
        <div className="flex gap-4">
          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
            >
              <Eraser className="w-3 h-3" />
              Clear Completed ({completedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
