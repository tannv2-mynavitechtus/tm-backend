import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  private tasks = [
    { id: 1, title: 'Task 1', status: 'TODO' },
    { id: 2, title: 'Task 2', status: 'DOING' },
    { id: 3, title: 'Task 3', status: 'RESOLVED' },
  ];

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    return this.tasks.find((task) => task.id === Number(id));
  }

  create(task: any) {
    const newTask = {
      id: this.tasks.length + 1,
      ...task,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id: number, task: any) {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...task };
      return this.tasks[index];
    }
    return null;
  }

  remove(id: number) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return true;
  }
}
