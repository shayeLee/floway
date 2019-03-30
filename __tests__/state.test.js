import { dispatch, state } from '../src/index';
import { of, from } from 'rxjs';

test("test state's name has registered", () => {
  state({
    name: 'test',
    defaultValue: 'test'
  });
  expect(() => {
    return (test$ = state({
      name: 'test',
      defaultValue: 'test'
    }));
  }).toThrow();
});

test('test state(options) without options.producer', done => {
  const status$ = state({
    name: 'status',
    defaultValue: false
  });

  status$.subscribe(status => {
    expect(status).toBe(false);
    done();
  });
});

test('test state(options) with options.producer 1', done => {
  const status$ = state({
    name: 'status1',
    defaultValue: 1,
    producer(next, value, action) {
      switch (action.type) {
        case 'change':
          next(++value);
          break;
      }
    }
  });

  dispatch('status1', 'change');

  status$.subscribe(status => {
    expect(status).toBe(2);
    done();
  });
});

test('test state(options) with options.producer 2', done => {
  const status$ = state({
    name: 'status2',
    defaultValue: 1,
    initial: of(1),
    producer(next, value, action) {
      switch (action.type) {
        case 'change':
          next(++value);
          break;
      }
    }
  });

  dispatch('status2', 'change');

  status$.subscribe(status => {
    expect(status).toBe(2);
    done();
  });
});

test('test state(options) with options.producer 3', done => {
  const status$ = state({
    name: 'status3',
    initial: of(3),
    producer(next, value, action) {
      switch (action.type) {
        case 'change':
          next(value + 2);
          break;
      }
    }
  });

  dispatch('status3', 'change');

  status$.subscribe(status => {
    expect(status).toBe(5);
    done();
  });
});

test('test state(options) with options.producer 5', done => {
  const status$ = state({
    name: 'status5',
    defaultValue: 0,
    initial: from(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(5);
        }, 300);
      })
    )
  });

  status$.subscribe(status => {
    if (status !== 0) {
      expect(status).toBe(5);
      done();
    }
  });
});

test('test state(options) with options.producer 6', done => {
  const status$ = state({
    name: 'status6',
    defaultValue: 0,
    initial: from(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(6);
        }, 300);
      })
    ),
    producer(next, value, action) {
      switch (action.type) {
        case 'change':
          next(value + 2);
          break;
      }
    }
  });

  status$.subscribe(status => {
    expect(status).toBe(6);
    done();
  });
});

test('test state(options) with options.producer 7', done => {
  const status$ = state({
    name: 'status7',
    initial: from(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(7);
        }, 300);
      })
    ),
    producer(next, value, action) {
      switch (action.type) {
        case 'change':
          next(value + 2);
          break;
      }
    }
  });

  status$.subscribe(status => {
    expect(status).toBe(7);
    done();
  });
});
