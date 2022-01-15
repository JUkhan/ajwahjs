import { StateController } from '../src/stateController';
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
export enum Todoilter {
  ALL,
  ACTIVE,
  COMPLETED,
}
export interface TodoState {
  todos: Todo[];
  filter: Todoilter;
}
export class TodoController extends StateController<TodoState> {
  constructor() {
    super({ todos: [], filter: Todoilter.ALL });
  }
  addTodo(title: string) {
    this.emit({
      todos: [
        ...this.state.todos,
        { id: this.state.todos.length + 1, title, completed: false },
      ],
    });
  }
  toggleTodo(id: number) {
    this.emit({
      todos: this.state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    });
  }
  setFilter(filter: Todoilter) {
    this.emit({ filter });
  }
  getTodos() {
    return this.select((state) => {
      switch (state.filter) {
        case Todoilter.ALL:
          return state.todos;
        case Todoilter.ACTIVE:
          return state.todos.filter((todo) => !todo.completed);
        case Todoilter.COMPLETED:
          return state.todos.filter((todo) => todo.completed);
      }
    });
  }
}
