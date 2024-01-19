---
title: Custom Engines
---

Factory engines do not contain any factory methods until they are imported. Custom engines with curated collections of factory functions can be created,
supporting use cases where only a subset of functions are necessary, reducing the size of compiled code.

:::info
The `tournamentEngine` and `competitionEngine` exports from 'tods-competition-factory' are custom engines provided for backwards compatability with Competition Factory version 1.x
:::

```js
// queryEngine.ts
import { governors, syncEngine } from 'tods-competition-engine';

syncEngine.importMethods(governors, true, 1); // (object, traverse, maxDepth) => process child objects to add nested methods
// - or -
syncEngine.importMethods(governors.queryGovernor);

export const queryEngine = syncEngine;
```
