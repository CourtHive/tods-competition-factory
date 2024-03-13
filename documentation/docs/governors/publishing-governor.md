---
title: Publishing Governor
---

```js
import { publishingGovernor } from 'tods-competition-factory';
```

## getPublishState

Return publishing details for tournament, event(s), and/or draws.

```js
// return status for all events and tournament `orderOfPlay`
publishState = engine.getPublishState().publishState;
const orderOfPlayPublished = publishState.tournament.orderOfPlay.published;
// status returned for all events within tournamentRecord, accessed by eventId
const { published, publishedDrawIds, drawDetails } = publishState['eventId'].status;

// publishState for specific event
publishState = engine.getPublishState({ eventId }).publishState;
const eventPublished = publishState.status.published;

// publishState for specific draw
publishState = engine.getPublishState({ drawId }).publishState;
const drawPublished = publishState.status.published;
// when only specific stages or structures are published
const drawPublishDetail = publishState.status.drawDetail;
```

## publishEvent

Utilizes [getEventData](/docs/governors/event-governor#geteventdata) to prepare data for display. Differs from [getEventData](/docs/governors/event-governor#geteventdata) in that it modifies the `publishState` of the event. Subscriptions or middleware may be used to deliver the generated payload for presentation on a public website.

See [Policies](../concepts/policies) for more details on `policyDefinitions` and [Publishing](../concepts/publishing.md) for more on use cases.

```js
const policyDefinitions = Object.assign({}, ROUND_NAMING_POLICY, PARTICIPANT_PRIVACY_DEFAULT);

const { eventData } = engine.publishEvent({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  policyDefinitions, // optional - e.g. participant privacy policy (if not already attached)
  eventDataParams, // optional - params to pass to `getEventData`

  drawIdsToRemove, // optional - drawIds to remove from drawIds already published
  drawIdsToAdd, // optional - drawIds to add to drawIds already published

  drawDetails, // { [drawId]: { structureDetails, stageDetails, publishingDetail: { published: true, embargo: UTC Date string } }}

  eventId, // required - eventId of event to publish
});
```

---

## publishEventSeeding

```js
engine.publishEventSeeding({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  stageSeedingScaleNames, // { MAIN: 'mainScaleName', QUALIFYING: 'qualifyingScaleName' } - required if a distinction is made between MAIN and QUALIFYING seeding
  seedingScaleNames, // optional
  drawIds, // optional - publish specific drawIds (flights) within the event
  eventId,
});
```

---

## publishOrderOfPlay

```js
engine.publishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  scheduledDates, // optional - if not provided will publish all scheduledDates
  eventIds, // optional - if not provided will publish all eventIds
});
```

---

## unPublishEvent

Modifies the `publishState` of an event. `Subscriptions` or middleware can be used to trigger messaging to services which make event data visible on public websites.

```js
engine.unPublishEvent({
  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems
  eventId,
});
```

---

## unPublishEventSeeding

```js
engine.unPublishEventSeeding({
  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems
  stages, // optionally specify array of stages to be unpublished, otherwise unpublish all stages
  eventId,
});
```

---

## unPublishOrderOfPlay

```js
engine.unPublishOrderOfPlay({
  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems
});
```

---
