import { BehaviorSubject } from "rxjs";
import { isObject } from "./utils";

/**
 * 创建一个包含指定数据、并且可更新数据的observable
 * @function hotObservable
 * @param {*} data
 */
function ofHot(data) {
  const state$ = new BehaviorSubject(data);
  state$.__data__ = data;
  state$.update = function(mData) {
    let newData;
    const _data = typeof mData === "function" ? mData(state$.__data__) : mData;
    if (isObject(_data)) {
      newData = Object.assign({}, state$.__data__, _data);
    } else {
      newData = _data;
    }
    state$.__data__ = newData;
    state$.next(newData);
  };
  return state$;
}
export default ofHot;
