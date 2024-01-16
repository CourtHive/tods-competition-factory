---
title: Publishing
---

## Overview

Publishing is both a mechanism for controlling what information is available for public display and a means of triggering a notification to subscribers of various publishing-related topics.

## Event draws

Control of public display of draw structures is provided by [engine.publishEvent](/docs/governors/publishing-governor#publishevent); when this method is called a `timeItem` is attached to an event which directs filtering of draws and structures within draws and a notification is pushed to subscribers of the PUBLISH_EVENT topic.

The methods [engine.getEventData](/docs/governors/query-governor.md#geteventdata) and [engine.competitionScheduleMatchUps](/docs/governors/query-governor#competitionschedulematchups) utilize the PUBLISH.STATUS `timeItem` values when passed the parameter `{ usePublishState: true }` to filter the data they return.

```js
// publish all draws containted within event specified by eventId
engine.publishEvent({ eventId });

// publish specified drawId
engine.publishEvent({
  drawDetails: {
    ['drawId']: { publishingDetail: { published: true } },
  },
  eventId,
});

// alternative shorthand for publishing drawId(s)
engine.publishEvent({ eventId, drawIdsToAdd: ['drawId'] });

// unpublish specified drawId(s)
engine.publishEvent({ eventId, drawIdsToRemove: ['drawId'] });

// publish only QUALIFYING stage of specified drawId
engine.publishEvent({
  drawDetails: { ['drawId']: { stagesToAdd: [QUALIFYING] } },
  eventId,
});

// publish only first round of a specific structure
result = engine.publishEvent({
  drawDetails: {
    [drawId]: {
      structureDetails: { [structureId]: { roundLimit: 1, published: true } },
    },
  },
  eventId,
});
```

## Scheduled matchUps

Control of public display of scheduled matchUps is provided by [engine.publishOrderOfPlay](/docs/governors/publishing-governor#publishorderofplay); when this method is called a `timeItem` is attached to the tournament which directs filtering of matchUps and a notification is pushed to subscribers of the PUBLISH_ORDER_OF_PLAY topic.

The method [engine.competitionScheduleMatchUps](/docs/governors/query-governor#competitionschedulematchups) utilizes the PUBLISH.STATUS `timeItem` values when passed the parameter `{ usePublishState: true }` to filter the matchUps which are returned in `dateMatchUps`.

```js
engine.publishOrderOfPlay({
  removePriorValues: true, // when true remove all previous timeItems related to publishing Order of Play
  scheduledDates, // optional - if not provided will publish all scheduledDates
  eventIds, // optional - if not provided will publish all eventIds
});

const { dateMatchUps } = engine.competitionScheduleMatchUps({
  usePublishState: true,
});
```
