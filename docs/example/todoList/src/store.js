import { of } from "rxjs";
import { map } from "rxjs/operators";
import { state } from "../../../../src/index";

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
  producer(next, value, action) {
    const n = action.index;
    const item = action.item;
    const todos = value;
    switch (action.type) {
      case "checkItem":
        next(
          todos.map((item, i) => {
            if (i === n) {
              item.check = !item.check;
            }
            return item;
          })
        );
        break;
      case "delItem":
        todos.splice(n, 1);
        next(todos.slice());
        break;
      case "addItem":
        next(of(todos.concat(item)));
        break;
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
  producer(next, value, action) {
    switch (action.type) {
      case "show":
        next(true);
        break;
      case "hide":
        next(false);
        break;
    }
  }
});

export { todos$, undoneCount$, toastVisible$ };
