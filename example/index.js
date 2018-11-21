import Cookies from "js-cookie";
import { interval, fromEvent, of } from "rxjs";
import { switchMap, map, sample, combineLatest, delay, pluck, defaultIfEmpty } from "rxjs/operators";
import { distributor$, attract, setConfig, permeate, promiseOf } from "../src/index";

setConfig({
    preObservable: promiseOf(getPromise())
})

function getPromise() {
    return new Promise(resolve => {
        setTimeout(() => {
            Cookies.set("test", 666)
            resolve(666);
        }, 5000)
    })
}

function getPromise1() {
    console.log(Cookies.get("test"));
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("test");
        }, 1000)
    })
}

const source$ = promiseOf(getPromise1())/* attract("test").pipe(
    switchMap(() => {
        return promiseOf(getPromise1());
    })
);
distributor$.next("test"); */

const _app = class extends React.Component {
    render() {
        return (
            <div>{this.props.source}</div>
        );
    }
}

const App = permeate({ source: source$ })(_app)

ReactDOM.render(<App />, document.getElementById("app"));

document.addEventListener("click", function () {
    distributor$.next("test");
})



