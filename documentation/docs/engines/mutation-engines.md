---
title: Mutation Engines
---

Mutation engines can be **synchronous** or **asynchronous** and provide services which are unnecessary for queries.

For **asynchronous** engines it is necessary to set a global state provider which will make use of Node's `executionAsyncId()` to differentiate client requests.

## Notifications

Mutaion engines generate **notifications** which are delivered via functions defined by [Subscriptions](/docs/concepts/subscriptions).

## Rollback on Error

Passing the parameter `{ rollbackOnError: true }` to any engine function will revert shared state in the event of function error.

## Global State Provider

For **synchronous** engines it is unnecessary to set a global state provider.

An example `asyncGlobalState` provider is found in 'src/examples/asyneEngine'.

```js
import { globalState: { setStateProvider }} from 'tods-competition-factory';

setStateProvider(asyncGlobalState);
```
