import type { TodoList, UserRef } from '../types/Todo';

export function canWriteToList(list: TodoList | null, user: UserRef | null): boolean {
  if (!list || !user) {
    return false;
  }
  return !!list.members?.some(member => member.username === user.username);
}
