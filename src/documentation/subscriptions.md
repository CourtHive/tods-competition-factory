---
name: Subscriptions
menu: General Concepts
route: /concepts/subscriptions
---

# Subscriptions

Subscriptions enable external methods to be called when certain events occur while the Competition Factory engines are mutating a tournament document.

```js
const subscriptions = {
  modifyMatchUp: ({ payload }) => {}, // payload = { matchUp }
  addMatchUps: ({ payload }) => {}, // payload = { matchUps }
  deletedMatchUpIds: ({ payload }) => {}, // payload = { matchUpIds}
};
```

Subscriptions can be defined for the following engines.

```js
drawEngine.setSubscriptions(subscriptions);
tournamentEngine.setSubscriptions(subscriptions);
competitionEngine.setSubscriptions(subscriptions);
```
