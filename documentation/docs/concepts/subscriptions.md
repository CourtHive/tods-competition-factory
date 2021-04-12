---
title: Subscriptions
---

Subscriptions enable external methods to be called when certain events occur while the Competition Factory engines are mutating a tournament document.

```js
const subscriptions = {
  audit: (payload) => {}, // payload = [{ action: '', payload: {} }]

  addMatchUps: (payload) => {}, // payload = { matchUps }
  deletedMatchUpIds: (payload) => {}, // payload = { matchUpIds }
  modifyMatchUp: (payload) => {}, // payload = { matchUp }

  publishEvent: (payload) => (), // payload = { eventData }
  unPublishEvent: (payload) => (), // payload = { eventId }

  addVenue: (payload) => (), // payload { venue }
  modifyVenue: (payload) => (), // payload { venue }
  deleteVenue: (payload) => (), // payload { venueId }

  addParticipants: (payload) => () // payload { participants }
  modifyParticipants: (payload) => () // payload { participants }
  deleteParticipants: (payload) => () // payload { participantIds }
};
```

Subscriptions can be defined for the following engines.

```js
drawEngine.setSubscriptions(subscriptions);
tournamentEngine.setSubscriptions(subscriptions);
competitionEngine.setSubscriptions(subscriptions);
```
