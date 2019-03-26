import { eventBus, fromAction } from '../src/index';
import { map } from 'rxjs/operators';

test("test fromAction(type, options) with type is not string", () => {
  expect(() => fromAction(678)).toThrow();
})

test('test fromAction(type, options) without options', done => {
  const obs$ = fromAction('test eventType').pipe(
    map(action => {
      return action.type;
    })
  );

  obs$.subscribe(type => {
    expect(type).toBe('test eventType');
    done();
  });

  eventBus.next({
    'test eventType': {
      type: 'test eventType'
    }
  });
});

test('test fromAction(type, options) with options', done => {
  const obs$ = fromAction('test eventType', {
    useCache: true
  }).pipe(
    map(action => {
      return action.type;
    })
  );

  obs$.subscribe(type => {
    expect(type).toBe('test eventType');
    done();
  });

  eventBus.next({
    'test eventType': {
      type: 'test eventType'
    }
  });
});
