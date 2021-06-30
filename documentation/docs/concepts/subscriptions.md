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

Subscriptions are defined once for all engines.

```js
import { setSubcriptions } from 'tods-competition-factory';

setSubscriptions(subscriptions);
```
