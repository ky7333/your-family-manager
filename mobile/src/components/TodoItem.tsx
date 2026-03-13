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

  useEffect(() => {
    setTitle(todo.title);
    setDetails(todo.details ?? '');
    setDueDate(todo.dueDate ?? '');
    setPriority(todo.priority ?? 'MEDIUM');
  }, [todo]);

  const save = async () => {
    if (!title.trim()) {
      return;
    }
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

  return (
    <View className="gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="flex-row items-start gap-3">
        <Button
          label={todo.completed ? '✓' : '○'}
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full px-0"
          disabled={!canEdit || saving}
          onPress={() => {
            void onToggle();
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

      {!editing && canEdit ? (
        <View className="flex-row gap-2">
          <Button label="Edit" size="sm" variant="outline" onPress={() => setEditing(true)} />
          <Button
            label="Delete"
            size="sm"
            variant="destructive"
            onPress={() => {
              void onDelete();
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
