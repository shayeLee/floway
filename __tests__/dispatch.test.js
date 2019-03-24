import { dispatch, state } from '../src/index';
import { map } from 'rxjs/operators';

test('test dispatch(stateName, actions) while actions is string', done => {
  const count$ = state({
    name: 'count',
    value: 0,
    actions: {
      plus(action, value) {
        return ++value;
      }
    }
  });

  dispatch('count', 'plus');

  count$.subscribe(count => {
    expect(count).toBe(1);
    done();
  });
});

test('test dispatch(stateName, actions) while actions is object', done => {
  const count$ = state({
    name: 'count1',
    value: 0,
    actions: {
      plus(action, value) {
        return ++value;
      }
    }
  });

  dispatch('count1', { type: 'plus' });

  count$.subscribe(count => {
    expect(count).toBe(1);
    done();
  });
});

test('test dispatch(stateName, actions) while actions is array', done => {
  const count$ = state({
    name: 'count2',
    value: 0,
    actions: {
      plus(action, value) {
        return ++value;
      },
      minus(action, value) {
        return --value;
      }
    }
  });

  dispatch('count2', ['plus', { type: 'minus' }]);

  count$.subscribe(count => {
    expect(count).toBe(0);
    done();
  });
});