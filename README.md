# Floway

[![NPM version](https://img.shields.io/npm/v/floway.svg)](https://www.npmjs.com/package/floway)
[![Build Status](https://api.travis-ci.com/shayeLee/floway.svg?branch=master)](https://travis-ci.com/shayeLee/floway)
[![Coverage Status](https://coveralls.io/repos/github/shayeLee/floway/badge.svg?branch=master)](https://coveralls.io/github/shayeLee/floway?branch=master)
<br>
<br>
基于 `RxJS v6` 的 `React` 应用状态管理解决方案

## 功能特性

- 使用`state`操作符函数创建一个具有初始值的特殊的`observable`来定义状态，称为`stateObservable`
- `stateObservable`通过`dispatch action`的模式来更新状态(推送新的值)
- `stateObservable`具有当前值的概念，能够保存当前状态
- 使用`@subscription`装饰器订阅`observable`使React视图组件可以响应状态的变化
- `stateObservable`可以使用`RxJS`的操作符来动态计算状态(类似计算属性)
- 多个组件可以共享状态数据
- 可以在任意位置修改任意组件的状态

## 开始使用

请查看文档 [https://shayelee.github.io/floway/](https://shayelee.github.io/floway/)

