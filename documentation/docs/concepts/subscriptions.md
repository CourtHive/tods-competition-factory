---
name: Subscriptions
menu: General Concepts
route: /concepts/subscriptions
---

# Subscriptions

Subscriptions enable external methods to be called when certain events occur while the Competition Factory engines are mutating a tournament document.

```js
const subscriptions = {
  addMatchUps: (payload) => {}, // payload = { matchUps }
  audit: (payload) => {}, // payload = [{ action: '', payload: {} }]
  deletedMatchUpIds: (payload) => {}, // payload = { matchUpIds }
  modifyMatchUp: (payload) => {}, // payload = { matchUp }
  publishEvent: (payload) => (), // payload = { eventData }
  unPublishEvent: (payload) => (), // payload = { eventId }
  newPairParticipants: (payload) => (), // payload { participants }
};
```

Subscriptions can be defined for the following engines.

```js
drawEngine.setSubscriptions(subscriptions);
tournamentEngine.setSubscriptions(subscriptions);
competitionEngine.setSubscriptions(subscriptions);
```
