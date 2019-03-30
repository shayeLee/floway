import { dispatch, state } from '../src/index';

test('test dispatch(stateName, action) while action is string', done => {
  const count$ = state({
    name: 'count',
    defaultValue: 0,
    producer(next, value, action) {
      switch(action.type) {
        case "plus":
          next(++value);
          break;
      }
    }
  });

  dispatch('count', 'plus');

  count$.subscribe(count => {
    expect(count).toBe(1);
    done();
  });
});

test('test dispatch(stateName, action) while action is object', done => {
  const count$ = state({
    name: 'count1',
    defaultValue: 0,
    producer(next, value, action) {
      switch(action.type) {
        case "plus":
          next(++value);
          break;
      }
    }
  });

  dispatch('count1', { type: 'plus' });

  count$.subscribe(count => {
    expect(count).toBe(1);
    done();
  });
});