---
title: makeDeepCopy
---

```js
makeDeepCopy(element, convertExtensions, internalUse);
```

Makes a deep copy of a JSON object.

## convertExtensions

When **convertExtensions** is **true**, TODS extensions objects are converted as follows:

```js
// original
element.extensions: [ { name: 'extensionName', value: { a: 1 } }]

// after conversion
element._extensionName: { a: 1 }
```

This is useful for inContext representations of elements such as participants where "accessor strings" can be used to directly access values rather than searching through arrays of extensions; a good example of this is in Avoidance Policies.

- @param {object} element - any JSON object to be converted
- @param {boolean} convertExtensions - whether or not to convert extensions

## Disabling deep copies

In server environments where it is desireable for objects originating in back end storage (such as Mongo) to be modified directly, it is possible to disable `makeDeepCopy` several ways:

```js
import {
  setDeepCopy,
  drawEngine,
  tournamentEngine,
  competitionEngine,
} from 'tods-competition-factory';

drawEngine.setState(drawDefinition, false, deepCopyOptions);
tournamentEngine.setState(tournamentRecord, false, deepCopyOptions);
competitionEngine.setState(tournamentRecords, false, deepCopyOptions);

setDeepCopy(false, deepCopyOptions);
```

## internalUse and deepCopyOptions

`internalUse` is a boolean parameter which is sometimes used **_within_** factory methods to specify that `makeDeepCopy` must be used regardless; it pertains to methods which return **inContext** data which should never be persisted. There are some cases where this can cause problems, so a method is provided to configure how `makeDeepCopy` behaves in scenarios where it is disabled but must be used internally.

```js
const deepCopyOptions = {
  stringify: [], // any object keys in this array will be stringified (using a .toString() function if present on the object)
  toJSON: [], // any object keys in this array will be converted to JSON if there is a .toJSON() function on the object
  ignore: [], // any object keys in this array will be ignored
};

setDeepCopy(false, deepCopyOptions);
```
