import Cookies from "js-cookie";
import { interval, fromEvent, of } from "rxjs";
import { switchMap, map, sample, combineLatest, delay, pluck, defaultIfEmpty } from "rxjs/operators";
import { distributor$, attract, setConfig, permeate, promiseOf } from "../src/index";




