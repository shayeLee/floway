import { distributor$, attract, permeate } from "../src/index.js";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import React from "react";
import ReactDOM from "react-dom";

let test$ = attract("test").pipe(
    switchMap(function() {
        return of({ a: 1 });
    })
);

let App = permeate([test$])(() => (<div>666</div>));

ReactDOM.render(<App />, document.getElementById("app"));

distributor$.next(["test"]);