import React from 'react';
import { Todo } from '../types/Todo';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, data: Partial<Todo>) => void;
  onDelete: (id: number) => void;
  isProcessing?: boolean;
  isTemporary?: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onUpdate,
  onDelete,
  isProcessing = false,
  isTemporary = false,
}) => {
  const { id, title, completed } = todo;

  const handleToggle = () => {
    onUpdate(id, { completed: !completed });
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const showLoader = isTemporary || isProcessing;

  return (
    <li
      data-cy="Todo"
      className={`todo ${completed ? 'completed' : ''} ${
        isProcessing ? 'loading' : ''
      } ${isTemporary ? 'temp' : ''}`}
    >
      {/* Hidden checkbox + styled label */}
      <label
        className="todo__status-label"
        htmlFor={`todo-status-${id}`}
        aria-label="Toggle todo status"
      >
        <input
          id={`todo-status-${id}`}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={handleToggle}
          disabled={showLoader}
        />
      </label>

      {/* Title */}
      <span className="todo__title" data-cy="TodoTitle">
        {title}
      </span>

      {/* Delete button */}
      {!isTemporary && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={handleDelete}
          disabled={showLoader}
        >
          ×
        </button>
      )}

      <div
        className={`todo__loader ${showLoader ? 'is-active' : ''}`}
        data-cy="TodoLoader"
      >
        <div className="loader" />
      </div>
    </li>
  );
};
