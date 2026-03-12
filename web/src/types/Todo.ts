export interface UserRef {
  id: number;
  username: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdBy?: UserRef;
  completedBy?: UserRef;
}
