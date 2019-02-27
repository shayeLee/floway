import { map, combineLatest } from "rxjs/operators";

/**
 * 创建一个得到指定observable最新推送数据的可观察对象 
 * @param {observable} obs$ - 指定的observable
*/
function ofLast(obs$) {
  return obs$.pipe(
    combineLatest(),
    map(arr => arr[0])
  );
};
export default ofLast;
