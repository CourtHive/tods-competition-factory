---
title: Subscriptions
---

Subscriptions enable external methods to be called when certain events occur while the Competition Factory engines are mutating a tournament document.

The payload for each subscription is an array of objects, with each element of the array having been produced by an `addNotice` statement within engine methods. Subscription methods are called **_after_** an engine method completes, not during execution.

:::info
All engine methods may be passed the additional parameter `{ delayNotify: true }`, in which case subscription methods are **_not_** called until a subsequent engine method is invoked.
:::

```js
const subscriptions = {
  [topicConstants.AUDIT]: (payload) => {},

  [topicConstants.ADD_MATCHUPS]: (payload) => {},
  [topicConstants.DELETED_MATCHUP_IDS]: (payload) => {},
  [topicConstants.MODIFY_MATCHUP]: (payload) => {},

  // factory will use generated or generate inContextMatchUp (for updating public site)
  // this can be used on client but may not have all participantContext options
  [topicConstants.UPDATE_INCONTEXT_MATCHUP]: (payload) => {},

  [topicConstants.PUBLISH_EVENT]: (payload) => {},
  [topicConstants.UNPUBLISH_EVENT]: (payload) => {},

  [topicConstants.PUBLISH_EVENT_SEEDING]: (payload) => {},
  [topicConstants.UNPUBLISH_EVENT_SEEDING]: (payload) => (),

  [topicConstants.PUBLISH_ORDER_OF_PLAY]: (payload) => {},
  [topicConstants.UNPUBLISH_ORDER_OF_PLAY]: (payload) => (),

  [topicConstants.ADD_VENUE]: (payload) => {},
  [topicConstants.MODIFY_VENUE]: (payload) => {},
  [topicConstants.DELETE_VENUE]: (payload) => {},

  [topicConstants.add_participants]: (payload) => {},
  [topicConstants.MODIFY_PARTICIPANTS]: (payload) => {},
  [topicConstants.DELETE_PARTICIPANTS]: (payload) => {},

  [topicConstants.MODIFY_POSITION_ASSIGNMENTS]: (payload) => {},
  [topicConstants.MODIFY_SEED_ASSIGNMENTS]: (payload) => {},

  [topicConstants.ADD_DRAW_DEFINITION]: (payload) => {},
  [topicConstants.MODIFY_DRAW_DEFINITION]: (payload) => {},
  [topicConstants.DELETED_DRAW_IDS]: (payload) => {},

  [topicConstants.MODIFY_TOURNAMENT_DETAIL]: (payload) => {},
  [topicContants.ADD_SCALE_ITEMS]: (payload) => {},
  [topicConstants.DATA_ISSUE]: (payload) => {},

  // to notify of all mutations { methods, params }
  [topicConstants.MUTATIONS]: (payload) => {},
};
```

Subscriptions are defined once for all engines.

```js
import { globalState: { setSubcriptions } } from 'tods-competition-factory';

setSubscriptions(subscriptions);
```
