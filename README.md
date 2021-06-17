# ajwahjs

Framework agnostic state management tool without ceremonies and boilerplates

`CounterState`

```ts
interface CounterModel {
  count: number;
  loading: bool;
}

class CounterState extends StateController<CounterModel> {
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
}
```

## Consuming State in

`Vanilla js`

```ts
const csCtrl = Get(CounterState);
csCtrl.stream$.subscrie(console.log);
csCtrl.inc();
csCtrl.dec();
csCtrl.asyncInc();
```

`React`

```tsx
const CounterComponent = () => {
  const csCtrl = Get(CounterState);

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
  constructor(public csCtrl: CounterState) {}
}
```

`Vue`

```ts
export default {
  name: "Counter",
  components: {},
  setup() {
    const csCtrl = Get(CounterState);

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

`Map Action to State`

```ts
onInit() {
    this.mapActionToState(
      this.action$.whereType('asyncInc').pipe(
        tap(action => this.emit({ loading: true})),
        delay(500),
        map(action => ({ loading: false, count: this.state.count + 1 }))
      )
    );
  }
```

`Register Effectts`

```ts
onInit() {
    this.registerEffects(
        this.action$.whereType("SearchInput").pipe(
            debounceTime(320),
            distinctUntilChanged(),
            map((action) => ({ ...action, type: "SearchingTodod" }))
        )
    );
}
```

`Combining States`

```ts

 get todos$() {
    return combineLatest([
      this.stream$,
      this.remoteStream<SearchCategory>(SearchCategoryStateController)
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
