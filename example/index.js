import { distributor$, attract } from "../src/index.js";
import { switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';

attract({
    type: "test",
    useCache: true
}).pipe(
  switchMap(action => {
    return fromPromise(new Promise(resolve => {
        $.ajax("http://test.elderly.api.iqeq01.com:8099/api/v1/courseFinal/list", {
            contentType: "application/x-www-form-urlencoded",
            data: action.payload,
            success: function (res) {
                const data = res.data;
                resolve({
                    list: data
                });
            }
        });
    }));
  })
).subscribe(data => {
    console.log("得到数据");
});

window.addEventListener("load", function () {
    let clickNum = 0;
    let pageNum = 2;
    let pageSize = 5;
    document.getElementById("btn").addEventListener("click", function () {
        if (clickNum === 1) {
            pageNum = 1;
            pageSize = 10;
        }
        distributor$.next({
            type: "test",
            payload: {
                orderBy: "ClassTime asc",
                fiterAll: 0,
                pageNum: pageNum,
                pageSize: pageSize
            },
            options: {
                paginationFields: {
                    pageNum: "pageNum",
                    pageSize: "pageSize"
                }
            }
        });
        ++clickNum;
    });
});
