---
title: Accessors
---

Accessors are strings which describe an attribute path to a value nested within an object. They are used in [Avoidance Policies](./avoidance) and [scaleAttributes](../concepts/scaleItems).

```js
// given the follwoing accessor...
const accessor = 'individualParticipants.person.nationalityCode';

// an array of nationalityCodes can be accessed from a PAIR participant
const participant = {
  participantType: PAIR,
  individualParticipants: [{ person: { nationalityCode } }],
};
```
