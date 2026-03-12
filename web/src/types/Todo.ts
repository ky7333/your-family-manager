export interface UserRef {
  id: string;
  username: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdBy?: UserRef;
  completedBy?: UserRef;
}
