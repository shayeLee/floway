import { variables } from "shaye-sword";

let cacheData = {};


class Redis {
  /**
   * 初始化redis
   * @param {object} initialData - 初始缓存数据
  */
  constructor(initialData) {
    if (variables.isCorrect(initialData)) cacheData = initialData;
  }

  /**
   * 存储分页数据
   * @param {object} params
   * @param {string} params.key - 缓存名称
   * @param {number} params.pageNum - 分页页码
   * @param {number} params.pageSize - 单页条数
   * @param {array} data
  */
  storePagingData = (params, data) => {
    if (!variables.isObject(params)) {
      throw new TypeError(`params expect a object, but got ${typeof params}.`);
    } else {
      const keyType = typeof params.key;
      const pageNumType = typeof params.pageNum;
      const pageSizeType = typeof params.pageSize;
      if (keyType !== "string") {
        throw new TypeError(`params.key expect a string, but got ${keyType}.`);
      } else if (pageNumType !== "number") {
        throw new TypeError(`params.pageNum expect a number, but got ${pageNumType}.`);
      } else if (pageSizeType !== "number") {
        throw new TypeError(`params.pageSize expect a number, but got ${pageSizeType}.`);
      }
    }

    if (!Array.isArray(data)) {
      throw new TypeError(`data expect a array, but got ${typeof data}.`);
    }    

    const { key, pageNum, pageSize } = params;
    const startCursor = (pageNum - 1) * pageSize;
    const endCursor = startCursor + (data.length - 1);
    if (!variables.isObject(cacheData[key])) {
      cacheData[key] = {
        startCursor: null,
        endCursor: null,
        data: []
      };
    }
    
    if (cacheData[key]["data"]["length"] === 0) {
      cacheData[key]["data"] = data;
      cacheData[key]["startCursor"] = startCursor;
      cacheData[key]["endCursor"] = endCursor;
    } else {
      if (
        (startCursor < cacheData[key]["startCursor"]) &&
        (endCursor >= cacheData[key]["startCursor"]) &&
        (endCursor <= cacheData[key]["endCursor"])
      ) {
        const sourceArr = cacheData[key]["data"];
        const newtArr = data.slice(0, cacheData[key]["startCursor"] - startCursor);
        for (let i = (newtArr.length - 1); i > -1; i--) {
          sourceArr.unshift(newtArr[i]);
        }
        cacheData[key]["startCursor"] = startCursor;
      }
    }

    console.log(cacheData[key]);
  }
}

export default Redis;