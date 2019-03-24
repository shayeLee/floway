import { dispatch, state } from '../src/index';
import { map } from 'rxjs/operators';

test('test state(options) without options.actions', done => {
  const status$ = state({
    name: 'status',
    value: false
  });

  status$.subscribe(status => {
    expect(status).toBe(false);
    done();
  });
});

test('test state(options) with options.actions', done => {
  const status$ = state({
    name: 'status1',
    value: false,
    actions: {
      change(action, value) {
        return !value;
      }
    }
  });

  dispatch('status1', 'change');

  status$.subscribe(status => {
    expect(status).toBe(true);
    done();
  });
});
