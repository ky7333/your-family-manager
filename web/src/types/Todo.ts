export interface UserRef {
  id: number;
  username: string;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdBy?: UserRef;
  completedBy?: UserRef;
}
