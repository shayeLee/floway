import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { state } from '../../../../src/index';

const todos$ = state({
  name: 'todos',
  value: [
    {
      desc: '起床迎接新的一天',
      check: true
    },
    {
      desc: '到达公司开始新一天的工作',
      check: true
    },
    {
      desc: '去公司附近的学校食堂吃午饭',
      check: false
    },
    {
      desc: '下班骑电动车回家',
      check: false
    },
    {
      desc: '吃晚饭，出去吃或者自己做饭吃',
      check: false
    }
  ],
  actions: {
    checkItem: function(action, value) {
      const n = action.index;
      const todos = value;
      return todos.map((item, i) => {
        if (i === n) {
          item.check = !item.check;
        }
        return item;
      });
    },
    delItem: function(action, value) {
      const n = action.index;
      const todos = value;
      todos.splice(n, 1);
      return todos.slice();
    },
    addItem: function(action, value) {
      const todos = value;
      const item = action.item;
      return of(todos.concat(item));
    }
  }
});

// 未完成任务数量
const undoneCount$ = todos$.pipe(
  map(todos => {
    let _conut = 0;
    todos.forEach(item => {
      if (!item.check) ++_conut;
    });
    return _conut;
  })
);

const toastVisible$ = state({
  name: "toastVisible",
  value: false,
  actions: {
    show: function() {
      return true;
    },
    hide: function() {
      return false;
    }
  }
});

export { todos$, undoneCount$, toastVisible$ };
