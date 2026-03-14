import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import DueDatePickerField from './DueDatePickerField';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Todo, TodoPriority, UpdateTodoInput } from '../types/todo';

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

interface TodoItemProps {
  todo: Todo;
  canEdit: boolean;
  onToggle: () => Promise<void>;
  onUpdate: (payload: UpdateTodoInput) => Promise<void>;
  onDelete: () => Promise<void>;
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Something went wrong';
};

export default function TodoItem({
  todo,
  canEdit,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [details, setDetails] = useState(todo.details ?? '');
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '');
  const [priority, setPriority] = useState<TodoPriority>(todo.priority ?? 'MEDIUM');
  const [saving, setSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(todo.title);
    setDetails(todo.details ?? '');
    setDueDate(todo.dueDate ?? '');
    setPriority(todo.priority ?? 'MEDIUM');
    setActionError(null);
  }, [todo.id, todo.updatedAt]);

  const save = async () => {
    if (!title.trim()) {
      return;
    }
    setActionError(null);
    setSaving(true);
    try {
      await onUpdate({
        title,
        details,
        dueDate,
        priority,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleTodo = async () => {
    setActionError(null);
    setIsToggling(true);
    try {
      await onToggle();
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsToggling(false);
    }
  };

  const deleteCurrentTodo = async () => {
    setActionError(null);
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View className="gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="flex-row items-start gap-3">
        <Button
          label={todo.completed ? '✓' : '○'}
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full px-0"
          disabled={!canEdit || saving || isToggling || isDeleting}
          onPress={() => {
            void toggleTodo();
          }}
        />

        <View className="flex-1 gap-2">
          {editing ? (
            <>
              <Input value={title} onChangeText={setTitle} />
              <Input
                value={details}
                onChangeText={setDetails}
                placeholder="Details"
                multiline
                className="h-20 pt-3"
              />
              <DueDatePickerField value={dueDate} onChange={setDueDate} disabled={saving} />

              <View className="flex-row gap-2">
                {PRIORITIES.map(level => (
                  <Button
                    key={level}
                    label={level}
                    size="sm"
                    variant={priority === level ? 'default' : 'outline'}
                    onPress={() => setPriority(level)}
                  />
                ))}
              </View>

              <View className="flex-row gap-2">
                <Button label={saving ? 'Saving...' : 'Save'} disabled={saving} onPress={() => void save()} />
                <Button
                  label="Cancel"
                  variant="outline"
                  onPress={() => {
                    setTitle(todo.title);
                    setDetails(todo.details ?? '');
                    setDueDate(todo.dueDate ?? '');
                    setPriority(todo.priority ?? 'MEDIUM');
                    setEditing(false);
                  }}
                />
              </View>
            </>
          ) : (
            <>
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className={`font-semibold text-zinc-900 dark:text-zinc-100 ${todo.completed ? 'line-through opacity-70' : ''}`}>
                  {todo.title}
                </Text>
                <View className="rounded-full bg-zinc-200 px-2 py-0.5 dark:bg-zinc-700">
                  <Text className="text-xs text-zinc-700 dark:text-zinc-200">{todo.priority}</Text>
                </View>
                {todo.dueDate ? <Text className="text-xs text-zinc-500 dark:text-zinc-400">Due {todo.dueDate}</Text> : null}
              </View>

              {todo.details ? <Text className="text-sm text-zinc-600 dark:text-zinc-300">{todo.details}</Text> : null}

              <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                {todo.createdBy ? `Created by ${todo.createdBy.username}` : ''}
                {todo.completed && todo.completedBy ? ` · Completed by ${todo.completedBy.username}` : ''}
              </Text>
            </>
          )}
        </View>
      </View>

      {actionError ? <Text className="text-xs text-red-600 dark:text-red-400">{actionError}</Text> : null}

      {!editing && canEdit ? (
        <View className="flex-row gap-2">
          <Button
            label="Edit"
            size="sm"
            variant="outline"
            disabled={isDeleting || isToggling}
            onPress={() => setEditing(true)}
          />
          <Button
            label="Delete"
            size="sm"
            variant="destructive"
            disabled={isDeleting || isToggling}
            onPress={() => {
              void deleteCurrentTodo();
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
