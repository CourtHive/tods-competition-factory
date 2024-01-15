---
title: Venue Governor
---

## modifyCourt

```js
competitionEngine.modifyCourt({
  courtId,
  force, // applies only to dateAvailability, will remove scheduling information from matchUps where court is no longer available
  modifications: {
    courtName,
    dateAvailability,
    courtDimensions,
    onlineResources,
    surfaceCategory,
    surfacedDate,
    surfaceType,
    altitude,
    latitude,
    longitude,
    notes,
    pace,
  },
});
```

---
