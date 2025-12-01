import React from 'react';

interface TodoHeaderProps {
  allCompleted: boolean;
  newTitle: string;
  setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  isSubmitting: boolean;
  handleAddTodo: (e: React.FormEvent) => Promise<void>;
  handleToggleAll: () => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const TodoHeader: React.FC<TodoHeaderProps> = ({
  allCompleted,
  newTitle,
  setNewTitle,
  isSubmitting,
  handleAddTodo,
  handleToggleAll,
  inputRef,
}) => {
  return (
    <header className="todoapp__header">
      {/* Toggle All button */}
      <button
        type="button"
        className={`todoapp__toggle-all ${allCompleted ? 'active' : ''}`}
        onClick={handleToggleAll}
        data-cy="ToggleAll"
        aria-label="Toggle all todos"
      />

      {/* New Todo Field */}
      <form onSubmit={handleAddTodo}>
        <input
          ref={inputRef}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder={allCompleted ? 'All done!' : 'What needs to be done?'}
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          disabled={isSubmitting}
        />
      </form>
    </header>
  );
};
