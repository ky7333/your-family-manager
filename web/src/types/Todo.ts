export interface UserRef {
  id: string;
  username: string;
}

export interface TodoList {
  id: string;
  name: string;
  createdBy?: UserRef;
  members?: UserRef[];
  readOnlyMembers?: UserRef[];
}


export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Todo {
  id: string;
  title: string;
  details?: string | null;
  dueDate?: string | null;
  priority: TodoPriority;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  todoList?: TodoList;
  createdBy?: UserRef;
  completedBy?: UserRef;
}

export interface CreateTodoInput {
  listId: string;
  title: string;
  details?: string;
  dueDate?: string;
  priority?: TodoPriority;
  completed: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  details?: string;
  dueDate?: string;
  priority?: TodoPriority;
  completed?: boolean;
}

export interface CreateTodoListInput {
  name: string;
  sharedWithUsernames?: string[];
  readOnlySharedWithUsernames?: string[];
}

export interface UpdateTodoListInput {
  name?: string;
  sharedWithUsernames?: string[];
  readOnlySharedWithUsernames?: string[];
}
