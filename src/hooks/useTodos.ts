import { useState, useEffect, useRef, useCallback } from 'react';
import { Todo } from '../types/Todo';
import { getTodos, addTodo, updateTodo, deleteTodo } from '../api/todos';
import { ERROR_MESSAGES } from '../constants/errors';

export function useTodos(userId: number) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const [notification, setNotification] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Refocus after add
  useEffect(() => {
    if (!tempTodo) {
      focusInput();
    }
  }, [todos, tempTodo, focusInput]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getTodos();

        setTodos(list);
        setNotification(null);
      } catch {
        setNotification(ERROR_MESSAGES.LOAD);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleAddTodo = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmed = newTitle.trim();

      if (!trimmed) {
        setNotification(ERROR_MESSAGES.EMPTY_TITLE);
        focusInput();

        return;
      }

      const optimistic: Todo = {
        id: 0,
        title: trimmed,
        completed: false,
        userId,
      };

      setTempTodo(optimistic);
      setIsSubmitting(true);

      try {
        const created = await addTodo({
          title: trimmed,
          userId,
          completed: false,
        });

        setTodos(prev => [...prev, created]);
        setNewTitle('');
        setNotification(null);
      } catch {
        setNotification(ERROR_MESSAGES.ADD);
      } finally {
        setTempTodo(null);
        setIsSubmitting(false);
      }
    },
    [newTitle, userId, focusInput],
  );

  const handleUpdateTodo = useCallback(
    async (id: number, data: Partial<Todo>) => {
      setProcessingIds(ids => [...ids, id]);

      try {
        const updated = await updateTodo({ id, ...data });

        setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        setNotification(null);
      } catch {
        setNotification(ERROR_MESSAGES.UPDATE);
      } finally {
        setProcessingIds(ids => ids.filter(x => x !== id));
      }
    },
    [],
  );

  const handleDeleteTodo = useCallback(async (id: number) => {
    setProcessingIds(ids => [...ids, id]);

    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      setNotification(null);
    } catch {
      setNotification(ERROR_MESSAGES.DELETE);
    } finally {
      setProcessingIds(ids => ids.filter(x => x !== id));
    }
  }, []);

  const handleToggleAll = useCallback(async () => {
    const allCompleted = todos.length > 0 && todos.every(t => t.completed);
    const newStatus = !allCompleted;

    // Only update todos that actually change
    const todosToUpdate = todos.filter(t => t.completed !== newStatus);

    setProcessingIds(ids => [
      ...Array.from(new Set([...ids, ...todosToUpdate.map(t => t.id)])),
    ]);

    try {
      const updatedTodos = await Promise.all(
        todosToUpdate.map(todo =>
          updateTodo({ id: todo.id, completed: newStatus }),
        ),
      );

      setTodos(prev =>
        prev.map(t => updatedTodos.find(u => u.id === t.id) ?? t),
      );
      setNotification(null);
    } catch {
      setNotification(ERROR_MESSAGES.UPDATE);
    } finally {
      setProcessingIds(ids =>
        ids.filter(id => !todosToUpdate.some(t => t.id === id)),
      );
    }
  }, [todos]);

  return {
    todos,
    tempTodo,
    newTitle,
    setNewTitle,
    isSubmitting,
    notification,
    loading,
    processingIds,
    inputRef,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleAll,
  };
}
