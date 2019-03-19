import { of } from "rxjs";
import { map } from "rxjs/operators";
import { State } from "../../../../src/index";

const todos$ = new State(of([
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
]));

todos$.registerAction("checkItem", (todos, n) => todos.map((item, i) => {
  if (i === n) {
    item.check = !item.check;
  }
  return item;
}));
todos$.registerAction("delItem", (todos, n) => {
  todos.splice(n, 1);
  return todos.slice();
});
todos$.registerAction("addItem", (todos, item) => todos.concat(item));

const undoneCount$ = todos$.pipe(map(todos => {
  let _conut = 0;
  todos.forEach(item => {
    if (!item.check) ++_conut;
  });
  return _conut;
}));

export { todos$, undoneCount$ }