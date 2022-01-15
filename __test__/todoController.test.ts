import { ajwahTest } from 'ajwah-test';
import { TodoController, Todoilter } from './todoCoonroller';
import { Get, RemoveController } from '../src/provider';
import { map, mergeMap } from 'rxjs/operators';

describe('Controller: ', () => {
  let controller: TodoController;
  beforeEach(() => {
    controller = Get(TodoController);
  });
  afterEach(() => {
    RemoveController(TodoController);
  });

  it('init', async () => {
    await ajwahTest({
      build: () => controller.stream$,
      act: () => {
        controller.addTodo('first');
      },
      //skip: 1,
      verify: (states) => {
        console.log(states, '----');
        expect(states.length).toBe(2);
      },
    });
  });

  it('add 3 todos', async () => {
    await ajwahTest({
      build: () => controller.getTodos(),
      act: () => {
        controller.addTodo('first');
        controller.addTodo('second');
        controller.addTodo('third');
        controller.setFilter(Todoilter.ACTIVE);
      },
      //skip: 1,

      verify: (states) => {
        console.log(states);
        expect(states.length).toBe(4);
      },
    });
  });
  it('add 3 todos', async () => {
    await ajwahTest({
      build: () => controller.getTodos(),
      act: () => {
        controller.addTodo('first');
        controller.addTodo('second');
        controller.addTodo('third');
        controller.setFilter(Todoilter.ACTIVE);
        controller.toggleTodo(1);
        controller.setFilter(Todoilter.ACTIVE);
        controller.setFilter(Todoilter.ACTIVE);
      },
      //skip: 1,

      verify: (states) => {
        console.log(states);
        expect(states.length).toBe(5);

        expect(states[4].length).toBe(2);
      },
    });
  });
});
