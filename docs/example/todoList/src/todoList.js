import { of } from "rxjs";
import { map } from "rxjs/operators";
import { state } from "../../../../src/index";
import { pipe } from "rxjs";

const todos$ = state({
  name: "todos",
  value: [
    {
      desc: "起床迎接新的一天",
      check: true
    },
    {
      desc: "到达公司开始新一天的工作",
      check: true
    },
    {
      desc: "去公司附近的学校食堂吃午饭",
      check: false
    },
    {
      desc: "下班骑电动车回家",
      check: false
    },
    {
      desc: "吃晚饭，出去吃或者自己做饭吃",
      check: false
    }
  ],
  actions: {
    checkItem: pipe(
      map(action => {
        const n = action.payload;
        const todos = this.value;
        return todos.map((item, i) => {
          if (i === n) {
            item.check = !item.check;
          }
          return item;
        });
      })
    ),
    /* delItem: function(payload, value) {
      const n = payload;
      const todos = value;
      todos.splice(n, 1);
      return todos.slice();
    },
    addItem: function(payload, value) {
      const todos = value;
      const item = payload;
      return todos.concat(item);
    } */
  }
});

const undoneCount$ = todos$.pipe(
  map(todos => {
    let _conut = 0;
    todos.forEach(item => {
      if (!item.check) ++_conut;
    });
    return _conut;
  })
);

export { todos$, undoneCount$ };
