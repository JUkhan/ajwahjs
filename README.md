# ajwahjs

Framework agnostic state management tool without ceremonies and boilerplates

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

  asyncIncBy = effect<number>((num$) =>
    num$.pipe(
      tap((_) => this.emit({ loading: true })),
      delay(1000),
      tap((by) => this.emit({ count: this.state.count + by, loading: false }))
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
      {data.loading ? "loading..." : data.count}
    </p>
  );
};
```

`Angular`

```ts
@Component({
  selector: "app-counter",
  template: `
    <p>
      <button class="btn" (click)="csCtrl.inc()">+</button>
      <button class="btn" (click)="csCtrl.dec()">-</button>
      <button class="btn" (click)="csCtrl.asyncIn())">async(+)</button>
      <span *ngIf="csCtrl.stream$ | async as state"
        >{{ state.loading ? "loading..." : state.count }}
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

`counter` : [Angular Demo](https://stackblitz.com/edit/angular-ajwah-counter?file=src%2Fapp%2Fapp.component.ts) | [React Demo](https://stackblitz.com/edit/react-ajwah-counter?file=index.tsx) | [Vue Demo](https://stackblitz.com/edit/vue-ajwah-counter?file=src%2FApp.vue)

`todos` : [Angular Demo](https://stackblitz.com/edit/angular-ajwah-test?file=src%2Fapp%2Fapp.component.ts) | [React Demo](https://stackblitz.com/edit/react-ts-cb9zfa?file=index.tsx) | [Vue Demo](https://stackblitz.com/edit/vue-ajwah-store?file=src%2FApp.vue)
