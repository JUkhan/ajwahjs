import { merge } from "rxjs";
import { map, mapTo } from "rxjs/operators";
import { StateController } from "../src/stateController";

interface CounterState {
  count: number;
  loading?: boolean;
}

export class CounterController extends StateController<CounterState> {
  constructor() {
    super({ count: 0, loading: false });
  }

  increment() {
    this.emit({ count: this.state.count + 1 });
  }

  decrement() {
    this.emit({ count: this.state.count - 1 });
  }

  async asyncInc() {
    this.emit({ loading: true });
    await this.delay(10);
    this.emit({ count: this.state.count + 1, loading: false });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class RemoteController extends StateController<String> {
  constructor() {
    super("remote-controller");
  }
}

export class CounterController2 extends StateController<number> {
  constructor() {
    super(0);
  }
  inc() {
    this.emit(this.state + 1);
  }
  dec() {
    this.emit(this.state - 1);
  }
  async asyncInc() {
    this.dispatch("asyncInc");
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.inc();
  }
  async asyncInc2() {
    this.dispatch(new AsyncAction());
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.inc();
  }
  get count$() {
    return merge(
      this.action$.where((ac) => ac === "asyncInc").pipe(mapTo("loading...")),
      this.stream$.pipe(map((count) => `${count}`))
    );
  }

  get count2$() {
    return merge(
      this.action$.isA(AsyncAction).pipe(mapTo("loading...")),
      this.stream$.pipe(map((count) => `${count}`))
    );
  }
}

export class AsyncAction {
  data: number;
}
