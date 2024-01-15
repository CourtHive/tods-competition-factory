---
title: Publishing Governor
---

```js
import { governors: { publishingGovernor }} from 'tods-competition-factory';
```

## publishOrderOfPlay

```js
engine.publishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  scheduledDates, // optional - if not provided will publish all scheduledDates
  eventIds, // optional - if not provided will publish all eventIds
});
```

---

## unPublishOrderOfPlay

```js
engine.unPublishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
});
```

---
