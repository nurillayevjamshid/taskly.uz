export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  userId?: string;
  columnNames?: TaskColumnName;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskColumnName {
  id: string;
  projectId: string;
  project: Project;
  name1: string;
  name2: string;
  name3: string;
  name4: string;
  name5: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  color?: string;
  order: number;
  isStandard: boolean;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  assignee?: string;
  attachments: number;
  columnId: string;
  column: Column;
  tags: Tag[];
  comments: Comment[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  text: string;
  color: string;
  taskId: string;
  task: Task;
  createdAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  taskId: string;
  task: Task;
  createdAt: Date;
}
