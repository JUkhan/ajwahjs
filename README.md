# ajwahjs

Framework agnostic state management tools.

Reactive state management library. Manage your application's states, effects, and actions easy way. Make apps more scalable with a unidirectional data-flow.

Every `StateController` has the following features:

- Dispatching actions
- Filtering actions
- Adding effects
- Communications among Controllers[`Although they are independents`]

[Angular Todo App](https://github.com/JUkhan/todo-angular)


`CounterState`

```ts
interface CounterState {
  count: number;
  loading: bool;
}

class CounterStateCtrl extends StateController<CounterState> {
  constructor() {
    super({ count: 0, loading: false });
  }
  onInit() {}

  inc() {
    this.emit({ count: this.state.count++ });
  }

  dec() {
    this.emit({ count: this.state.count-- });
  }

  async asyncInc() {
    this.emit({ loading: true });
    await delay(1000);
    this.emit({ count: this.state.count++, loading: false });
  }

  asyncIncBy = this.effect<number>((num$) =>
    num$.pipe(
      tap((_) => this.emit({ loading: true })),
      delay(1000),
      map((by) => ({ count: this.state.count + by, loading: false }))
    )
  );
}
```

## Consuming State in

`Vanilla js`

```ts
const csCtrl = Get(CounterStateCtrl);
csCtrl.stream$.subscrie(console.log);
csCtrl.inc();
csCtrl.dec();
csCtrl.asyncInc();
csCtrl.asyncIncBy(5);
```

`React`

```tsx
const CounterComponent = () => {
  const csCtrl = Get(CounterStateCtrl);

  const data = useStream(csCtrl.stream$, csCtrl.state);

  return (
    <p>
      <button className="btn" onClick={() => csCtrl.inc()}>
        +
      </button>
      <button className="btn" onClick={() => csCtrl.dec()}>
        -
      </button>
      <button className="btn" onClick={() => csCtrl.asyncInc()}>
        async(+)
      </button>
      {data.loading ? 'loading...' : data.count}
    </p>
  );
};
```

`Angular`

```ts
@Component({
  selector: 'app-counter',
  template: `
    <p>
      <button class="btn" (click)="csCtrl.inc()">+</button>
      <button class="btn" (click)="csCtrl.dec()">-</button>
      <button class="btn" (click)="csCtrl.asyncIn())">async(+)</button>
      <span *ngIf="csCtrl.stream$ | async as state"
        >{{ state.loading ? 'loading...' : state.count }}
      </span>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  constructor(public csCtrl: CounterStateCtrl) {}
}
```

`Vue`

```ts
<template>
  <p>
    <button class="btn" @click="inc()">+</button>
    <button class="btn" @click="dec()">-</button>
    <button class="btn" @click="asyncInc()">async(+)</button>
    {{ state.loading?'loading...':state.count }}
  </p>
</template>

export default {
  name: "Counter",
  components: {},
  setup() {
    const csCtrl = Get(CounterStateCtrl);

    const state = useStream(csCtrl.stream$, csCtrl.state);

    function inc() {
      csCtrl.inc();
    }
    function dec() {
      csCtrl.dec();
    }
    function asyncInc() {
      csCtrl.asyncInc();
    }

    return { inc, dec, asyncInc, state };
  },
};
```

`Effects`

```ts
onInit() {
    this.effectOnAction(
      this.action$.isA(AsyncInc).pipe(
        tap((_) => this.emit({ loading: true })),
        delay(1000),
        map((action) => ({ count: this.state.count + action.data, loading: false  }))
    ));
}

asyncIncBy = effect<number>((num$) =>
  num$.pipe(
    tap((_) => this.emit({ loading: true })),
    delay(1000),
    tap((by) => this.emit({ count: this.state.count + by, loading: false }))
  )
);

```

`Combining States`

```ts

 get todos$() {
    return combineLatest([
      this.stream$,
      this.remoteStream<SearchCategory>(SearchCategoryStateCtrl)
    ]).pipe(
      map(([todos, searchCategory]) => {
        switch (searchCategory) {
          case SearchCategory.active:
            return todos.filter(todo => !todo.completed);
          case SearchCategory.completed:
            return todos.filter(todo => todo.completed);
          default:
            return todos;
        }
      })
    );
  }
```

### Todo Service
```ts
import { Injectable } from "@angular/core";
import { StateController } from './store';
import { getTodos, HasMessage, IAppService, Visibility, SearchTodo, Todo, tween } from './app.service.types'
import { delay, filter, tap, map, combineLatest, startWith, exhaustMap, repeat, takeUntil, endWith } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AppService extends StateController<IAppService>{

    constructor() {
        super({
            message: null,
            todos: [],
            visibility: 'all',
            isSearching: false,
            loading: false,
        });
    }

    override onInit() {
        this.emit({ todos: getTodos() })
        this.effectOnAction(
            this.action$.isA(HasMessage).pipe(
                filter(_ => this.state.message !== null),
                delay(3000),
                map(_ => (<IAppService>{ message: null }))
            )
        )
    }

    setVisibility(visibility: Visibility) {
        this.emit({ visibility })
    }

    toggleSearch() {
        this.emit({ isSearching: !this.state.isSearching })
    }

    addTodo(task: string) {
        if (this.state.isSearching) return
        if (!task) {
            this.emit({ message: { type: 'error', message: 'Task is required.' } })
            return
        }
        const todos = this.state.todos.concat();
        todos.push({ id: todos.length + 1, task, completed: false })
        this.throttle({ todos, message: { type: 'info', message: 'Todo added successfully' } });
    }

    updateTodo(id: number) {
        const todos = this.state.todos.map(todo => {
            if (todo.id === id) {
                todo = { ...todo, completed: !todo.completed }
            }
            return todo;
        });

        this.throttle({ todos, message: { type: 'info', message: 'Todo updated successfully' } });
    }

    removeTodo(id: number) {
        const todos = this.state.todos.filter(todo => todo.id !== id);
        this.throttle({ todos, message: { type: 'info', message: 'Todo removed successfully' } });
    }

    #loadingStart$ = this.select(state => state.loading).pipe(filter(val => val));

    #loadingEnd$ = this.select(state => state.loading).pipe(filter(val => !val));

    rotate$ = this.#loadingStart$.pipe(
        exhaustMap(() => tween(0, 360, 1000).pipe(
            repeat(),
            takeUntil(this.#loadingEnd$),
            endWith(0)
        ))
    )

    isSearching$ = this.select(state => state.isSearching)

    message$ = this.select(state => state.message).pipe(
        tap(msg => {
            if (msg) { this.dispatch(new HasMessage()) }
        }),
    );

    activeTodo$ = this.select(state => state.todos).pipe(
        map(todos => todos.filter(todo => !todo.completed).length));

    visibility$ = this.select(state => state.visibility)

    todo$ = combineLatest([
        this.select(state => state.todos),
        this.select(state => state.visibility),
        this.action$.isA(SearchTodo).pipe(
            filter(_ => this.state.isSearching),
            map(search => search.searchText),
            startWith('')
        )
    ]).pipe(
        map(([todos, visibility, searchText]) => {
            if (searchText) {
                todos = todos.filter(todo => todo.task.toLowerCase().includes(searchText))
            }
            if (visibility === 'active') {
                todos = todos.filter(todo => !todo.completed)
            }
            else if (visibility === 'completed') {
                todos = todos.filter(todo => todo.completed)
            }
            return todos;
        })
    );

    throttle = this.effect<Partial<IAppService>>(todo$ => todo$.pipe(
        tap(_ => this.emit({ loading: true })),
        delay(1300),
        map(state => {
            state.loading = false;
            return state;
        })
    ));
}
```
<p><code>counter</code> : <a href="https://stackblitz.com/edit/angular-ajwah-counter?file=src%2Fapp%2Fapp.component.ts" rel="nofollow">Angular Demo</a> | <a href="https://stackblitz.com/edit/react-ajwah-counter?file=index.tsx" rel="nofollow">React Demo</a> | <a href="https://stackblitz.com/edit/vue-ajwah-counter?file=src%2FApp.vue" rel="nofollow">Vue Demo</a></p>

<p><code>todos</code> : <a href="https://stackblitz.com/edit/angular-ajwah-test?file=src%2Fapp%2Fapp.component.ts" rel="nofollow">Angular Demo</a> | <a href="https://stackblitz.com/edit/react-ts-cb9zfa?file=index.tsx" rel="nofollow">React Demo</a> | <a href="https://stackblitz.com/edit/vue-ajwah-store?file=src%2FApp.vue" rel="nofollow">Vue Demo</a></p>
