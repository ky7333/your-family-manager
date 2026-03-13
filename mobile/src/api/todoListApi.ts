import type { CreateTodoListInput, TodoList, UpdateTodoListInput } from '../types/todo';
import { parseJson, request } from './http';

export async function fetchTodoLists(): Promise<TodoList[]> {
  const response = await request('/todo-lists');
  return parseJson<TodoList[]>(response);
}

export async function addTodoList(payload: CreateTodoListInput): Promise<TodoList> {
  const response = await request('/todo-lists', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return parseJson<TodoList>(response);
}

export async function updateTodoList(id: string, payload: UpdateTodoListInput): Promise<TodoList> {
  const response = await request(`/todo-lists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return parseJson<TodoList>(response);
}
