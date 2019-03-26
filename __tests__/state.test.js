import { dispatch, state } from '../src/index';
import { map } from 'rxjs/operators';

test('test state(options) without options.producer', done => {
  const status$ = state({
    name: 'status',
    value: false
  });

  status$.subscribe(status => {
    expect(status).toBe(false);
    done();
  });
});

test('test state(options) with options.producer', done => {
  const status$ = state({
    name: 'status1',
    value: false,
    producer(next, value, action) {
      switch(action.type) {
        case "change":
          next(!value);
          break;
      }
    }
  });

  dispatch('status1', 'change');

  status$.subscribe(status => {
    expect(status).toBe(true);
    done();
  });
});
