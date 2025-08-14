import type { Todo } from '../types/Todo';
import { BACKEND_BASE_URL } from '../config';

const API_URL = `${BACKEND_BASE_URL}/todos`;

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(API_URL, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to add todo');
  return res.json();
}

export async function updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete todo');
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${BACKEND_BASE_URL}/j_security_check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}`,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Login failed');
}

export async function logout(): Promise<void> {
  const res = await fetch(`${BACKEND_BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
}
