---
name: makeDeepCopy
menu: Utilities
route: /utilities/makedeepcopy
---

# makeDeepCopy

```js
makeDeepCopy(element, convertExtensions);
```

Makes a deep copy of a JSON object.

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
