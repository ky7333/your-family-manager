import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from '../api/todoApi';
import type { Todo } from '../types/Todo';
import { Trash2 } from 'lucide-react';

export const Route = createFileRoute('/todos')({
  component: TodosPage,
});

function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTodos()
      .then(setTodos)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const todo = await addTodo({ title: newTitle, completed: false });
      setTodos([...todos, todo]);
      setNewTitle('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await updateTodo(todo.id, { ...todo, completed: !todo.completed });
      setTodos(todos.map(t => (t.id === todo.id ? updated : t)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEdit = async (id: string, title: string) => {
    try {
      const updated = await updateTodo(id, { title });
      setTodos(todos.map(t => (t.id === id ? updated : t)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Todos</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a todo..."
          className="border px-2 py-1 flex-1 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Add</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => handleToggle(todo)}
            onEdit={title => handleEdit(todo.id, title)}
            onDelete={() => handleDelete(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({ todo, onToggle, onEdit, onDelete }: {
  todo: Todo;
  onToggle: () => void;
  onEdit: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      onEdit(editTitle);
    }
    setEditing(false);
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded shadow p-4 mb-2 flex items-center">
      <input type="checkbox" checked={todo.completed} onChange={onToggle} />
      {editing ? (
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="border px-1 rounded flex-1 mx-2 bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
          autoFocus
        />
      ) : (
        <span className="flex-1 mx-2">
          {todo.title}
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {todo.createdBy && (
              <span>Created by: {todo.createdBy.username}</span>
            )}
            {todo.completed && todo.completedBy && (
              <span> &middot; Completed by: {todo.completedBy.username}</span>
            )}
          </div>
        </span>
      )}
      <button onClick={onDelete} className="text-red-500" aria-label="Delete">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
