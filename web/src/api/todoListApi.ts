import { BACKEND_BASE_URL } from '../config';
import type { CreateTodoListInput, TodoList, UpdateTodoListInput } from '../types/Todo';

const API_URL = `${BACKEND_BASE_URL}/todo-lists`;

export async function fetchTodoLists(): Promise<TodoList[]> {
  const res = await fetch(API_URL, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch todo lists');
  return res.json();
}

export async function addTodoList(payload: CreateTodoListInput): Promise<TodoList> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create todo list');
  return res.json();
}

export async function updateTodoList(id: string, payload: UpdateTodoListInput): Promise<TodoList> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update todo list');
  return res.json();
}
