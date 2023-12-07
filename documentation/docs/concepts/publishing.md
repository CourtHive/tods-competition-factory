---
title: Publishing
---

## Overview

Publishing is both a mechanism for controlling what information is available for public display and a means of triggering a notification to subscribers of various publishing-related topics.

## Event draws

Control of public display of draw structures is provided by [tournamentEngine.publishEvent](../apis/tournament-engine-api.md#publishevent); when this method is called a `timeItem` is attached to an event which directs filtering of draws and structures within draws and a notification is pushed to subscribers of the PUBLISH_EVENT topic.

The methods [tournamentEnigne.getEventData](../apis/tournament-engine-api.md#geteventdata) and [competitionEngine.competitionScheduleMatchUps](../apis/competition-engine-api.md#competitionschedulematchups) utilize the PUBLISH.STATUS `timeItem` values when passed the parameter `{ usePublishState: true }` to filter the data they return.

```js
// publish all draws containted within event specified by eventId
tournamentEngine.publishEvent({ eventId });

// publish specified drawId
tournamentEngine.publishEvent({
  drawDetails: {
    ['drawId']: { publishingDetail: { published: true } },
  },
  eventId,
});

// alternative shorthand for publishing drawId(s)
tournamentEngine.publishEvent({ eventId, drawIdsToAdd: ['drawId'] });

// unpublish specified drawId(s)
tournamentEngine.publishEvent({ eventId, drawIdsToRemove: ['drawId'] });

// publish only QUALIFYING stage of specified drawId
tournamentEngine.publishEvent({
  drawDetails: { ['drawId']: { stagesToAdd: [QUALIFYING] } },
  eventId,
});
```

## Scheduled matchUps

Control of public display of scheduled matchUps is provided by [tournamentEngine.publishOrderOfPlay](../apis//tournament-engine-api.md#publishorderofplay) and [competitionEngine.publishOrderOfPlay](../apis/competition-engine-api.md#publishorderofplay); when either of these methods is called a `timeItem` is attached to the tournament which directs filtering of matchUps and a notification is pushed to subscribers of the PUBLISH_ORDER_OF_PLAY topic.

The method [competitionEngine.competitionScheduleMatchUps](../apis/competition-engine-api.md#competitionschedulematchups) utilizes the PUBLISH.STATUS `timeItem` values when passed the parameter `{ usePublishState: true }` to filter the matchUps which are returned in `dateMatchUps`.

```js
competitionEngine.publishOrderOfPlay({
  removePriorValues: true, // when true remove all previous timeItems related to publishing Order of Play
  scheduledDates, // optional - if not provided will publish all scheduledDates
  eventIds, // optional - if not provided will publish all eventIds
});

const { dateMatchUps } = competitionEngine.competitionScheduleMatchUps({
  usePublishState: true,
});
```
