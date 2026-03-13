import type { CreateTodoInput, Todo, UpdateTodoInput } from '../types/todo';
import { parseJson, request } from './http';

export async function fetchTodos(listId: string): Promise<Todo[]> {
  const response = await request(`/todos?listId=${encodeURIComponent(listId)}`);
  return parseJson<Todo[]>(response);
}

export async function addTodo(todo: CreateTodoInput): Promise<Todo> {
  const response = await request('/todos', {
    method: 'POST',
    body: JSON.stringify(todo),
  });
  return parseJson<Todo>(response);
}

export async function updateTodo(id: string, todo: UpdateTodoInput): Promise<Todo> {
  const response = await request(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(todo),
  });
  return parseJson<Todo>(response);
}

export async function deleteTodo(id: string): Promise<void> {
  await request(`/todos/${id}`, { method: 'DELETE' });
}
