import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { addTodo, deleteTodo, fetchTodos, updateTodo } from '../api/todoApi';
import { addTodoList, fetchTodoLists } from '../api/todoListApi';
import { searchUsersByUsername, type UserSearchResult } from '../api/userApi';
import { useUser } from '../lib/UserContext';
import { canWriteToList } from '../lib/todoAccess';
import type { Todo, TodoList, TodoPriority, UpdateTodoInput } from '../types/Todo';

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export const Route = createFileRoute('/todos')({
  component: TodosPage,
});

function TodosPage() {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);

  const [newListName, setNewListName] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedMemberUsernames, setSelectedMemberUsernames] = useState<string[]>([]);
  const [memberSearchResults, setMemberSearchResults] = useState<UserSearchResult[]>([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [readOnlyMemberQuery, setReadOnlyMemberQuery] = useState('');
  const [selectedReadOnlyMemberUsernames, setSelectedReadOnlyMemberUsernames] = useState<string[]>([]);
  const [readOnlyMemberSearchResults, setReadOnlyMemberSearchResults] = useState<UserSearchResult[]>([]);
  const [searchingReadOnlyMembers, setSearchingReadOnlyMembers] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<TodoPriority>('MEDIUM');

  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [savingTodo, setSavingTodo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const selectedList = useMemo(
    () => lists.find(list => list.id === selectedListId) ?? null,
    [lists, selectedListId],
  );

  const selectedListIsWritable = useMemo(
    () => canWriteToList(selectedList, user),
    [selectedList, user],
  );

  useEffect(() => {
    const loadLists = async () => {
      setLoadingLists(true);
      setError(null);
      try {
        const loadedLists = await fetchTodoLists();
        setLists(loadedLists);
        const firstList = loadedLists.at(0);
        if (firstList) {
          setSelectedListId(current => current ?? firstList.id);
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error));
      } finally {
        setLoadingLists(false);
      }
    };

    void loadLists();
  }, []);

  useEffect(() => {
    const loadTodos = async () => {
      if (!selectedListId) {
        setTodos([]);
        return;
      }

      setLoadingTodos(true);
      setError(null);
      try {
        const loadedTodos = await fetchTodos(selectedListId);
        setTodos(loadedTodos);
      } catch (error: unknown) {
        setError(getErrorMessage(error));
      } finally {
        setLoadingTodos(false);
      }
    };

    void loadTodos();
  }, [selectedListId]);

  useEffect(() => {
    const query = memberQuery.trim();
    if (!query) {
      setMemberSearchResults([]);
      setSearchingMembers(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchingMembers(true);
      try {
        const results = await searchUsersByUsername(query, controller.signal);
        setMemberSearchResults(
          results.filter(result => !selectedMemberUsernames.includes(result.username)),
        );
      } catch (error: unknown) {
        if (!isAbortError(error)) {
          setError(getErrorMessage(error));
        }
      } finally {
        setSearchingMembers(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [memberQuery, selectedMemberUsernames]);

  useEffect(() => {
    const query = readOnlyMemberQuery.trim();
    if (!query) {
      setReadOnlyMemberSearchResults([]);
      setSearchingReadOnlyMembers(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchingReadOnlyMembers(true);
      try {
        const results = await searchUsersByUsername(query, controller.signal);
        setReadOnlyMemberSearchResults(
          results.filter(
            result =>
              !selectedMemberUsernames.includes(result.username)
              && !selectedReadOnlyMemberUsernames.includes(result.username),
          ),
        );
      } catch (error: unknown) {
        if (!isAbortError(error)) {
          setError(getErrorMessage(error));
        }
      } finally {
        setSearchingReadOnlyMembers(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [readOnlyMemberQuery, selectedMemberUsernames, selectedReadOnlyMemberUsernames]);

  const addMemberChip = (username: string) => {
    setSelectedReadOnlyMemberUsernames(prev => prev.filter(value => value !== username));
    setSelectedMemberUsernames(prev => (prev.includes(username) ? prev : [...prev, username]));
    setMemberQuery('');
    setMemberSearchResults([]);
  };

  const addReadOnlyMemberChip = (username: string) => {
    if (selectedMemberUsernames.includes(username)) {
      return;
    }
    setSelectedReadOnlyMemberUsernames(prev => (prev.includes(username) ? prev : [...prev, username]));
    setReadOnlyMemberQuery('');
    setReadOnlyMemberSearchResults([]);
  };

  const removeMemberChip = (username: string) => {
    setSelectedMemberUsernames(prev => prev.filter(value => value !== username));
  };

  const removeReadOnlyMemberChip = (username: string) => {
    setSelectedReadOnlyMemberUsernames(prev => prev.filter(value => value !== username));
  };

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    const listName = newListName.trim();
    if (!listName) {
      return;
    }

    setSavingList(true);
    setError(null);
    try {
      const created = await addTodoList({
        name: listName,
        sharedWithUsernames: selectedMemberUsernames,
        readOnlySharedWithUsernames: selectedReadOnlyMemberUsernames,
      });
      setLists(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedListId(created.id);
      setNewListName('');
      setMemberQuery('');
      setSelectedMemberUsernames([]);
      setMemberSearchResults([]);
      setReadOnlyMemberQuery('');
      setSelectedReadOnlyMemberUsernames([]);
      setReadOnlyMemberSearchResults([]);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setSavingList(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId) {
      return;
    }

    if (!selectedListIsWritable) {
      setError('This list is read-only for you');
      return;
    }

    const title = newTitle.trim();
    if (!title) {
      return;
    }

    setSavingTodo(true);
    setError(null);
    try {
      const created = await addTodo({
        listId: selectedListId,
        title,
        details: newDetails,
        dueDate: newDueDate,
        priority: newPriority,
        completed: false,
      });
      setTodos(prev => [created, ...prev]);
      setNewTitle('');
      setNewDetails('');
      setNewDueDate('');
      setNewPriority('MEDIUM');
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setSavingTodo(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    if (!selectedListIsWritable) {
      setError('This list is read-only for you');
      return;
    }
    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos(prev => prev.map(item => (item.id === todo.id ? updated : item)));
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  };

  const handleUpdateTodo = async (id: string, payload: UpdateTodoInput) => {
    if (!selectedListIsWritable) {
      setError('This list is read-only for you');
      return;
    }
    try {
      const updated = await updateTodo(id, payload);
      setTodos(prev => prev.map(item => (item.id === id ? updated : item)));
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!selectedListIsWritable) {
      setError('This list is read-only for you');
      return;
    }
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(item => item.id !== id));
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-6xl px-4 pb-8">
      <h1 className="mb-6 text-3xl font-bold">Todos</h1>
      {error && <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{error}</div>}

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Lists</h2>
          <form onSubmit={handleAddList} className="mb-4 space-y-2">
            <input
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="List name"
              className="w-full rounded border bg-transparent px-3 py-2 text-sm"
              disabled={savingList}
            />
            <div className="rounded border p-2">
              <div className="mb-2 flex flex-wrap gap-1">
                {selectedMemberUsernames.map(username => (
                  <span key={username} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                    {username}
                    <button
                      type="button"
                      onClick={() => removeMemberChip(username)}
                      className="rounded-full px-1 leading-none hover:bg-black/10"
                      aria-label={`Remove ${username}`}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={memberQuery}
                onChange={e => setMemberQuery(e.target.value)}
                onKeyDown={e => {
                  const firstResult = memberSearchResults.at(0);
                  if (e.key === 'Enter' && firstResult) {
                    e.preventDefault();
                    addMemberChip(firstResult.username);
                  }
                }}
                placeholder="Search usernames to share"
                className="w-full rounded border bg-transparent px-3 py-2 text-sm"
                disabled={savingList}
              />
            </div>
            {searchingMembers && (
              <p className="text-xs text-muted-foreground">Searching users...</p>
            )}
            {!searchingMembers && memberSearchResults.length > 0 && (
              <ul className="max-h-32 overflow-auto rounded border">
                {memberSearchResults.map(result => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => addMemberChip(result.username)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary"
                    >
                      {result.username}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="rounded border p-2">
              <p className="mb-2 text-xs text-muted-foreground">Read-only members</p>
              <div className="mb-2 flex flex-wrap gap-1">
                {selectedReadOnlyMemberUsernames.map(username => (
                  <span key={username} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                    {username}
                    <button
                      type="button"
                      onClick={() => removeReadOnlyMemberChip(username)}
                      className="rounded-full px-1 leading-none hover:bg-black/10"
                      aria-label={`Remove read-only ${username}`}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={readOnlyMemberQuery}
                onChange={e => setReadOnlyMemberQuery(e.target.value)}
                onKeyDown={e => {
                  const firstResult = readOnlyMemberSearchResults.at(0);
                  if (e.key === 'Enter' && firstResult) {
                    e.preventDefault();
                    addReadOnlyMemberChip(firstResult.username);
                  }
                }}
                placeholder="Search usernames for read-only access"
                className="w-full rounded border bg-transparent px-3 py-2 text-sm"
                disabled={savingList}
              />
            </div>
            {searchingReadOnlyMembers && (
              <p className="text-xs text-muted-foreground">Searching users...</p>
            )}
            {!searchingReadOnlyMembers && readOnlyMemberSearchResults.length > 0 && (
              <ul className="max-h-32 overflow-auto rounded border">
                {readOnlyMemberSearchResults.map(result => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => addReadOnlyMemberChip(result.username)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary"
                    >
                      {result.username}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="submit"
              disabled={savingList}
              className="w-full rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {savingList ? 'Creating...' : 'Create list'}
            </button>
          </form>

          {loadingLists && <p className="text-sm text-muted-foreground">Loading lists...</p>}

          <ul className="space-y-1">
            {lists.map(list => (
              <li key={list.id}>
                <button
                  type="button"
                  className={`w-full rounded px-3 py-2 text-left text-sm ${
                    list.id === selectedListId
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => setSelectedListId(list.id)}
                >
                  <div className="font-medium">{list.name}</div>
                  {list.members && list.members.length > 0 && (
                    <div className="text-xs opacity-80">
                      {list.members.length} write {list.members.length === 1 ? 'member' : 'members'}
                      {list.readOnlyMembers && list.readOnlyMembers.length > 0 && ` · ${list.readOnlyMembers.length} read-only`}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {!loadingLists && lists.length === 0 && (
            <p className="text-sm text-muted-foreground">No lists yet. Create one to get started.</p>
          )}
        </aside>

        <section className="rounded-xl border bg-card p-4">
          {!selectedList && (
            <p className="text-muted-foreground">
              Select a list on the left to view todos.
            </p>
          )}

          {selectedList && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{selectedList.name}</h2>
                {!selectedListIsWritable && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">You have read-only access to this list.</p>
                )}
                {selectedList.members && selectedList.members.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Shared with (write): {selectedList.members.map(member => member.username).join(', ')}
                  </p>
                )}
                {selectedList.readOnlyMembers && selectedList.readOnlyMembers.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Shared with (read-only): {selectedList.readOnlyMembers.map(member => member.username).join(', ')}
                  </p>
                )}
              </div>

              <form onSubmit={handleAddTodo} className="mb-6 grid gap-2 rounded-lg border p-3 md:grid-cols-2">
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Todo title"
                  className="rounded border bg-transparent px-3 py-2 text-sm md:col-span-2"
                  disabled={savingTodo || !selectedListIsWritable}
                />
                <textarea
                  value={newDetails}
                  onChange={e => setNewDetails(e.target.value)}
                  placeholder="Details"
                  rows={2}
                  className="rounded border bg-transparent px-3 py-2 text-sm md:col-span-2"
                  disabled={savingTodo || !selectedListIsWritable}
                />
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full rounded border bg-transparent px-3 py-2 text-sm"
                    disabled={savingTodo || !selectedListIsWritable}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TodoPriority)}
                    className="w-full rounded border bg-transparent px-3 py-2 text-sm"
                    disabled={savingTodo || !selectedListIsWritable}
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority} value={priority} className="text-black">
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={savingTodo || !selectedListIsWritable}
                  className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 md:col-span-2"
                >
                  {savingTodo ? 'Adding...' : selectedListIsWritable ? 'Add todo' : 'Read-only access'}
                </button>
              </form>

              {loadingTodos && <p className="text-sm text-muted-foreground">Loading todos...</p>}
              {!loadingTodos && todos.length === 0 && (
                <p className="text-sm text-muted-foreground">No todos in this list yet.</p>
              )}

              <ul className="space-y-3">
                {todos.map(todo => (
                  <li key={todo.id}>
                    <TodoItem
                      todo={todo}
                      onToggle={() => handleToggleTodo(todo)}
                      onUpdate={payload => handleUpdateTodo(todo.id, payload)}
                      onDelete={() => handleDeleteTodo(todo.id)}
                      canEdit={selectedListIsWritable}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  canEdit,
}: {
  todo: Todo;
  onToggle: () => void;
  onUpdate: (payload: UpdateTodoInput) => void;
  onDelete: () => void;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [details, setDetails] = useState(todo.details ?? '');
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '');
  const [priority, setPriority] = useState<TodoPriority>(todo.priority ?? 'MEDIUM');

  useEffect(() => {
    setTitle(todo.title);
    setDetails(todo.details ?? '');
    setDueDate(todo.dueDate ?? '');
    setPriority(todo.priority ?? 'MEDIUM');
  }, [todo]);

  const save = () => {
    if (!title.trim()) {
      return;
    }
    onUpdate({
      title,
      details,
      dueDate,
      priority,
    });
    setEditing(false);
  };

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={todo.completed} onChange={onToggle} className="mt-1" disabled={!canEdit} />

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded border bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={2}
                className="w-full rounded border bg-transparent px-3 py-2 text-sm"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full rounded border bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as TodoPriority)}
                    className="w-full rounded border bg-transparent px-3 py-2 text-sm"
                  >
                    {PRIORITIES.map(value => (
                      <option key={value} value={value} className="text-black">
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={save} className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle(todo.title);
                    setDetails(todo.details ?? '');
                    setDueDate(todo.dueDate ?? '');
                    setPriority(todo.priority ?? 'MEDIUM');
                    setEditing(false);
                  }}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className={`font-medium ${todo.completed ? 'line-through opacity-70' : ''}`}>
                  {todo.title}
                </span>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                  {todo.priority ?? 'MEDIUM'}
                </span>
                {todo.dueDate && (
                  <span className="text-xs text-muted-foreground">Due {todo.dueDate}</span>
                )}
              </div>

              {todo.details && (
                <p className="mb-2 text-sm text-muted-foreground">{todo.details}</p>
              )}

              <p className="text-xs text-muted-foreground">
                {todo.createdBy && `Created by ${todo.createdBy.username}`}
                {todo.completed && todo.completedBy && ` · Completed by ${todo.completedBy.username}`}
              </p>
            </>
          )}
        </div>

        {!editing && canEdit && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setEditing(true)} className="rounded border px-2 py-1 text-xs">
              Edit
            </button>
            <button onClick={onDelete} className="text-red-500" aria-label="Delete">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
