import { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addTodo, deleteTodo, fetchTodos, updateTodo } from '../api/todoApi';
import { addTodoList, fetchTodoLists } from '../api/todoListApi';
import { searchUsersByUsername } from '../api/userApi';
import DueDatePickerField from '../components/DueDatePickerField';
import MemberPicker from '../components/MemberPicker';
import TodoItem from '../components/TodoItem';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useUser } from '../context/UserContext';
import { canWriteToList } from '../lib/todoAccess';
import type { Todo, TodoList, TodoPriority, UpdateTodoInput } from '../types/todo';
import type { UserSearchResult } from '../types/user';

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
};

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError';

const sortListsByName = (lists: TodoList[]) =>
  [...lists].sort((a, b) => a.name.localeCompare(b.name));

export default function TodosScreen() {
  const { user, signOut } = useUser();
  const colorScheme = useColorScheme();

  const [lists, setLists] = useState<TodoList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);

  const [newListName, setNewListName] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedMemberUsernames, setSelectedMemberUsernames] = useState<string[]>([]);
  const [memberSearchResults, setMemberSearchResults] = useState<UserSearchResult[]>([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [readOnlyMemberQuery, setReadOnlyMemberQuery] = useState('');
  const [selectedReadOnlyMemberUsernames, setSelectedReadOnlyMemberUsernames] = useState<string[]>(
    [],
  );
  const [readOnlyMemberSearchResults, setReadOnlyMemberSearchResults] = useState<UserSearchResult[]>(
    [],
  );
  const [searchingReadOnlyMembers, setSearchingReadOnlyMembers] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<TodoPriority>('MEDIUM');

  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [savingTodo, setSavingTodo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedList = useMemo(
    () => lists.find(list => list.id === selectedListId) ?? null,
    [lists, selectedListId],
  );

  const selectedListIsWritable = useMemo(
    () => canWriteToList(selectedList, user),
    [selectedList, user],
  );

  const loadLists = async () => {
    setLoadingLists(true);
    setError(null);
    try {
      const loadedLists = sortListsByName(await fetchTodoLists());
      setLists(loadedLists);
      setSelectedListId(current => {
        if (!loadedLists.length) {
          return null;
        }
        if (current && loadedLists.some(list => list.id === current)) {
          return current;
        }
        return loadedLists[0].id;
      });
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoadingLists(false);
    }
  };

  const loadTodos = async (listId: string | null) => {
    if (!listId) {
      setTodos([]);
      return;
    }

    setLoadingTodos(true);
    setError(null);
    try {
      setTodos(await fetchTodos(listId));
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoadingTodos(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadLists();
      await loadTodos(selectedListId);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadLists();
  }, []);

  useEffect(() => {
    void loadTodos(selectedListId);
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
      } catch (caughtError: unknown) {
        if (!isAbortError(caughtError)) {
          setError(getErrorMessage(caughtError));
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
              !selectedMemberUsernames.includes(result.username) &&
              !selectedReadOnlyMemberUsernames.includes(result.username),
          ),
        );
      } catch (caughtError: unknown) {
        if (!isAbortError(caughtError)) {
          setError(getErrorMessage(caughtError));
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
    setSelectedReadOnlyMemberUsernames(prev =>
      prev.includes(username) ? prev : [...prev, username],
    );
    setReadOnlyMemberQuery('');
    setReadOnlyMemberSearchResults([]);
  };

  const removeMemberChip = (username: string) => {
    setSelectedMemberUsernames(prev => prev.filter(value => value !== username));
  };

  const removeReadOnlyMemberChip = (username: string) => {
    setSelectedReadOnlyMemberUsernames(prev => prev.filter(value => value !== username));
  };

  const handleAddList = async () => {
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
      setLists(prev => sortListsByName([...prev, created]));
      setSelectedListId(created.id);
      setNewListName('');
      setMemberQuery('');
      setSelectedMemberUsernames([]);
      setMemberSearchResults([]);
      setReadOnlyMemberQuery('');
      setSelectedReadOnlyMemberUsernames([]);
      setReadOnlyMemberSearchResults([]);
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSavingList(false);
    }
  };

  const handleAddTodo = async () => {
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
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
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
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
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
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
      throw caughtError;
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
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colorScheme === 'dark' ? '#f4f4f5' : '#18181b'}
            onRefresh={() => void refresh()}
          />
        }
      >
        <View className="mb-1 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Todos</Text>
            <Text className="text-sm text-zinc-600 dark:text-zinc-300">
              Signed in as {user?.username}
            </Text>
          </View>
          <Button
            label="Sign out"
            variant="outline"
            onPress={() => {
              void signOut();
            }}
          />
        </View>

        {error ? (
          <View className="rounded-md border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/60">
            <Text className="text-sm text-red-700 dark:text-red-300">{error}</Text>
          </View>
        ) : null}

        <Card className="gap-4">
          <CardHeader className="mb-0 gap-1">
            <CardTitle>Create List</CardTitle>
            <CardDescription>
              Add a new list and optionally share it with read/write or read-only members.
            </CardDescription>
          </CardHeader>

          <Input
            value={newListName}
            onChangeText={setNewListName}
            placeholder="List name"
            editable={!savingList}
          />

          <MemberPicker
            title="Write members"
            placeholder="Search usernames to share"
            query={memberQuery}
            selectedUsernames={selectedMemberUsernames}
            searchResults={memberSearchResults}
            searching={searchingMembers}
            disabled={savingList}
            onQueryChange={setMemberQuery}
            onAdd={addMemberChip}
            onRemove={removeMemberChip}
          />

          <MemberPicker
            title="Read-only members"
            placeholder="Search usernames for read-only access"
            query={readOnlyMemberQuery}
            selectedUsernames={selectedReadOnlyMemberUsernames}
            searchResults={readOnlyMemberSearchResults}
            searching={searchingReadOnlyMembers}
            disabled={savingList}
            onQueryChange={setReadOnlyMemberQuery}
            onAdd={addReadOnlyMemberChip}
            onRemove={removeReadOnlyMemberChip}
          />

          <Button
            label={savingList ? 'Creating...' : 'Create list'}
            disabled={savingList}
            onPress={() => {
              void handleAddList();
            }}
          />
        </Card>

        <Card className="gap-3">
          <CardHeader className="mb-0 gap-1">
            <CardTitle>Lists</CardTitle>
            <CardDescription>Select a list to view and manage todos.</CardDescription>
          </CardHeader>

          {loadingLists ? <Text className="text-sm text-zinc-500 dark:text-zinc-400">Loading lists...</Text> : null}

          {!loadingLists && lists.length === 0 ? (
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">No lists yet. Create one to get started.</Text>
          ) : null}

          {lists.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {lists.map(list => (
                  <Button
                    key={list.id}
                    label={list.name}
                    variant={list.id === selectedListId ? 'default' : 'outline'}
                    onPress={() => setSelectedListId(list.id)}
                  />
                ))}
              </View>
            </ScrollView>
          ) : null}
        </Card>

        {selectedList ? (
          <>
            <Card className="gap-3">
              <CardHeader className="mb-0 gap-1">
                <CardTitle>{selectedList.name}</CardTitle>
                <CardDescription>
                  {selectedListIsWritable
                    ? 'You can create and edit todos in this list.'
                    : 'You have read-only access to this list.'}
                </CardDescription>
              </CardHeader>

              {selectedList.members && selectedList.members.length > 0 ? (
                <Text className="text-sm text-zinc-600 dark:text-zinc-300">
                  Shared with (write):{' '}
                  {selectedList.members.map(member => member.username).join(', ')}
                </Text>
              ) : null}

              {selectedList.readOnlyMembers && selectedList.readOnlyMembers.length > 0 ? (
                <Text className="text-sm text-zinc-600 dark:text-zinc-300">
                  Shared with (read-only):{' '}
                  {selectedList.readOnlyMembers.map(member => member.username).join(', ')}
                </Text>
              ) : null}
            </Card>

            <Card className="gap-3">
              <CardHeader className="mb-0 gap-1">
                <CardTitle>Create Todo</CardTitle>
                <CardDescription>Add a task to this list.</CardDescription>
              </CardHeader>

              <Input
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Todo title"
                editable={!savingTodo && selectedListIsWritable}
              />

              <Input
                value={newDetails}
                onChangeText={setNewDetails}
                placeholder="Details"
                multiline
                className="h-20 pt-3"
                editable={!savingTodo && selectedListIsWritable}
              />

              <DueDatePickerField
                value={newDueDate}
                onChange={setNewDueDate}
                disabled={savingTodo || !selectedListIsWritable}
              />

              <View className="flex-row flex-wrap gap-2">
                {PRIORITIES.map(level => (
                  <Button
                    key={level}
                    label={level}
                    size="sm"
                    variant={newPriority === level ? 'default' : 'outline'}
                    onPress={() => setNewPriority(level)}
                    disabled={savingTodo || !selectedListIsWritable}
                  />
                ))}
              </View>

              <Button
                label={
                  savingTodo
                    ? 'Adding...'
                    : selectedListIsWritable
                      ? 'Add todo'
                      : 'Read-only access'
                }
                disabled={savingTodo || !selectedListIsWritable}
                onPress={() => {
                  void handleAddTodo();
                }}
              />
            </Card>

            <View className="gap-3">
              {loadingTodos ? <Text className="text-sm text-zinc-500 dark:text-zinc-400">Loading todos...</Text> : null}
              {!loadingTodos && todos.length === 0 ? (
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">No todos in this list yet.</Text>
              ) : null}

              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  canEdit={selectedListIsWritable}
                  onToggle={() => handleToggleTodo(todo)}
                  onUpdate={payload => handleUpdateTodo(todo.id, payload)}
                  onDelete={() => handleDeleteTodo(todo.id)}
                />
              ))}
            </View>
          </>
        ) : (
          <Card>
            <Text className="text-zinc-600 dark:text-zinc-300">Select a list to view todos.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
