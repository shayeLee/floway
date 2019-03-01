# 概念

## observable (可观察对象)

!> 可以认为`observable`是一种特殊的数据类型<br>
  它结合了观察者模式和函数式编程范式

- 观察者模式:<br>
  有观察者订阅时，`observable`就会推送数据

  ```javascript
  const obs$ = of(123);
  
  obs$.subscribe(data => {
    console.log(data);  // log: 123
  })
  ```

- 函数式编程范式:<br>
  - 函子:<br>
    `observable`是一种函子(容器)，它包含两样东西:
    - 值(data): 一个或者多个值，依次推送
    - 值的变形关系(pipe函数): 依次作用于推送的每个值，将当前`observable`变形成另一个`observable`

      ```javascript
      const obs$1 = of(3);
      const obs$2 = of(3).pipe(map(data => {
        return data + 3;
      }));
      obs$2.subscribe(data => {
        console.log(data);  // log: 6
      });
      ```

  - `observable`之间可以自由连接与组合:

    ```javascript
    const obs$1 = of(1);
    const obs$2 = of(2);
    const obs$3 = obs$1.pipe(zip(obs$2));
    obs$3.subscribe(data => {
      console.log(data);  // log: [1, 2]
    });
    ```

## async programming (异步编程)

`observable`非常适合用来异步编程，因为不管是同步或者异步，只能通过观察者订阅`observable`来得到数据，并且`observable`之间还可以自由连接与组合

```javascript
const obs$1 = from(new Promise(resolve => {
  setTimeout(() => {
    resolve(1);
  }, 2000)
}));

const obs$2 = of(2);
obs$1.subscribe(data => {
  console.log(data);  // log: 1
});

const obs$3 = obs$1.pipe(concat(obs$2));

obs$3.subscribe(data => {
  // 订阅2秒后 log: 1
  // 紧接着 log: 2
  console.log(data);
});
```