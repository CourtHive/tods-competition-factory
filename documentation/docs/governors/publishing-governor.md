---
title: Publishing Governor
---

The **Publishing Governor** provides methods for controlling the public visibility of tournament information through publish state management. These methods work in conjunction with [Time Items](../concepts/timeItems) to track what's published and when.

```js
import { publishingGovernor } from 'tods-competition-factory';
```

:::tip
See **[Publishing Concepts](../concepts/publishing)** for comprehensive coverage of publishing workflows, rationale, and best practices.
:::

## Overview

Publishing operates at multiple levels of granularity:

- **Tournament Level**: Participants, Order of Play
- **Event Level**: All draws, specific draws (flights), seeding
- **Draw Level**: Entire draws, specific stages (MAIN, QUALIFYING, CONSOLATION)
- **Structure Level**: Specific structures, round-by-round visibility

All publishing methods:

- Update publish state via [Time Items](../concepts/timeItems)
- Trigger [subscription notifications](/docs/engines/subscriptions)
- Support `removePriorValues` to clear previous publish state
- Enable fine-grained control over information release

---

## getPublishState

Returns publishing details for tournament, event(s), and/or draws, enabling queries about current publish state before making changes.

### Return All Publish State

```js
const { publishState } = engine.getPublishState();

// Tournament-level state
const participantsPublished = publishState.tournament.participants.published;
const orderOfPlayPublished = publishState.tournament.orderOfPlay.published;

// Event-level state (accessed by eventId)
const eventState = publishState['eventId'].status;
const {
  published, // boolean - is event published?
  publishedDrawIds, // array of published draw IDs
  drawDetails, // granular stage/structure details
} = eventState;
```

### Query Specific Event

```js
const { publishState } = engine.getPublishState({ eventId });
const eventPublished = publishState.status.published;
const publishedDraws = publishState.status.publishedDrawIds;
```

### Query Specific Draw

```js
const { publishState } = engine.getPublishState({ drawId });
const drawPublished = publishState.status.published;

// When only specific stages or structures are published
const drawPublishDetail = publishState.status.drawDetail;
// Example structure: { stages: ['MAIN'], structures: { [structureId]: { roundLimit: 2 } } }
```

**Use Cases**:

- Verify current state before publishing
- Display publish status in admin UI
- Determine if re-publishing is needed
- Query embargo status

---

## publishEvent

Publishes event draws and structures with fine-grained control over visibility. Generates optimized `eventData` payload and triggers `PUBLISH_EVENT` subscription notifications.

**Key Features**:

- Publishes entire events or specific draws (flights)
- Stage-level control (MAIN, QUALIFYING, CONSOLATION)
- Structure and round-level granularity
- Embargo support for scheduled publication
- Privacy policy application
- Subscription notification with prepared payload

```js
const { eventData } = engine.publishEvent({
  eventId, // required - event to publish

  // Draw selection (choose one approach)
  drawIdsToAdd, // array - publish specific draws
  drawIdsToRemove, // array - unpublish specific draws
  drawDetails, // object - granular control (see below)

  // Data preparation
  eventDataParams, // optional - params for getEventData (not persisted)
  policyDefinitions, // optional - privacy policies to apply

  // State management
  removePriorValues, // optional boolean - clear previous timeItems
});
```

### Publishing Patterns

#### Publish All Draws in Event

```js
engine.publishEvent({ eventId });
```

#### Publish Specific Draws (Flights)

```js
// Shorthand
engine.publishEvent({
  eventId,
  drawIdsToAdd: ['drawId1', 'drawId2'],
});

// Remove draws from publication
engine.publishEvent({
  eventId,
  drawIdsToRemove: ['drawId3'],
});
```

#### Publish by Stage

```js
import { stageConstants } from 'tods-competition-factory';

engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      stagesToAdd: [stageConstants.QUALIFYING],
      publishingDetail: { published: true },
    },
  },
});
```

#### Round-by-Round Publishing

```js
// Publish only first round of a structure
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: {
          roundLimit: 1,
          published: true,
        },
      },
    },
  },
});

// Expand to include more rounds
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: {
          roundLimit: 3, // Now shows rounds 1-3
          published: true,
        },
      },
    },
  },
});
```

#### Publishing with Embargo

```js
const embargoTime = new Date('2024-06-15T10:00:00Z').toISOString();

engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      publishingDetail: {
        published: true,
        embargo: embargoTime, // Don't display until this time
      },
    },
  },
});
```

#### Publishing with Privacy Policies

```js
import { policyConstants } from 'tods-competition-factory';

const privacyPolicy = {
  participant: {
    contacts: false,
    addresses: false,
    individualParticipants: {
      contacts: false,
      addresses: false,
    },
  },
};

const { eventData } = engine.publishEvent({
  eventId,
  policyDefinitions: {
    [policyConstants.POLICY_TYPE_PARTICIPANT]: privacyPolicy,
  },
});
```

#### Customizing Event Data Payload

:::important
Event data parameters are **not persisted** in publish state. Client applications must pass their own parameters when querying with `usePublishState: true`.
:::

```js
// Server-side publishing
const { eventData } = engine.publishEvent({
  eventId,
  eventDataParams: {
    allParticipantResults: true,
    participantsProfile: {
      withISO2: true,
      withIOC: true,
    },
  },
});

// Client must pass same params when querying
const { eventData: clientData } = engine.getEventData({
  eventId,
  usePublishState: true,
  allParticipantResults: true,
  participantsProfile: { withISO2: true, withIOC: true },
});
```

**See**: [Publishing Concepts](../concepts/publishing#data-preparation-for-publishing) for details on eventData structure.

---

## publishEventSeeding

Publishes event seeding information separately from draw structures, enabling flexible control over when seeding becomes publicly visible.

**Why Separate Seeding Publication**:

- Prevent participants from knowing seeded positions before draws finalized
- Announce seeded players separately from draw structure
- Update seeding without re-publishing entire draw
- Different scales for different stages

```js
engine.publishEventSeeding({
  eventId, // required

  // Scale selection
  seedingScaleNames, // optional - array of scale names
  stageSeedingScaleNames, // optional - { MAIN: 'scale1', QUALIFYING: 'scale2' }

  // Draw selection
  drawIds, // optional - publish specific draws only

  // State management
  removePriorValues, // optional boolean - clear previous timeItems
});
```

### Examples

#### Publish All Seeding

```js
engine.publishEventSeeding({ eventId });
```

#### Publish Specific Scales

```js
engine.publishEventSeeding({
  eventId,
  seedingScaleNames: ['U18', 'WTN'],
});
```

#### Different Scales per Stage

```js
engine.publishEventSeeding({
  eventId,
  stageSeedingScaleNames: {
    MAIN: 'U18',
    QUALIFYING: 'U18Q',
  },
});
```

#### Publish Specific Flights

```js
engine.publishEventSeeding({
  eventId,
  drawIds: ['flight1', 'flight2'],
});
```

---

## publishOrderOfPlay

Publishes scheduled matchUps (Order of Play), controlling visibility of which matches are scheduled for which courts and times.

**Why Order of Play Publishing**:

- Prepare schedules internally before announcing
- Make scheduling changes before public release
- Coordinate releases with media partners
- Publish each day's schedule separately

```js
engine.publishOrderOfPlay({
  scheduledDates, // optional - array of dates to publish
  eventIds, // optional - array of events to publish
  removePriorValues, // optional boolean - clear previous timeItems
});
```

### Examples

#### Publish All Scheduled MatchUps

```js
engine.publishOrderOfPlay();
```

#### Publish Specific Dates

```js
engine.publishOrderOfPlay({
  scheduledDates: ['2024-06-15', '2024-06-16'],
});
```

#### Publish Specific Events

```js
engine.publishOrderOfPlay({
  eventIds: ['singles-main', 'doubles-main'],
});
```

#### Daily Publication

```js
// Each morning, publish that day's schedule
const today = new Date().toISOString().split('T')[0];

engine.publishOrderOfPlay({
  scheduledDates: [today],
  removePriorValues: false, // Keep previous days published
});
```

#### Replace All Previous Publications

```js
engine.publishOrderOfPlay({
  scheduledDates: ['2024-06-15'],
  eventIds: ['singles-main'],
  removePriorValues: true, // Clear all previous
});
```

**Query Published Schedules**:

```js
const { dateMatchUps } = engine.competitionScheduleMatchUps({
  usePublishState: true, // Only returns published matchUps
});
```

**See**: [Query Governor - competitionScheduleMatchUps](/docs/governors/query-governor#competitionschedulematchups)

---

## publishParticipants

Publishes the tournament participant list, controlling when participant information becomes publicly visible.

**Why Participant Publishing**:

- Accept entries internally before announcing participant list
- Control when participant information becomes public
- Coordinate announcements with promotional campaigns
- Staged announcements (wildcards separate from direct acceptances)

```js
engine.publishParticipants({
  removePriorValues, // optional boolean - clear previous timeItems
});
```

### Examples

#### Publish Participants

```js
engine.publishParticipants();
```

#### Replace Previous Publication

```js
engine.publishParticipants({
  removePriorValues: true,
});
```

---

## unPublishEvent

Removes event from public visibility. Triggers `UNPUBLISH_EVENT` subscription notification.

```js
engine.unPublishEvent({
  eventId, // required
  removePriorValues, // optional boolean, defaults to true
});
```

### Examples

```js
// Unpublish event (removes timeItems)
engine.unPublishEvent({ eventId });

// Unpublish without removing timeItems
engine.unPublishEvent({
  eventId,
  removePriorValues: false,
});
```

**Use Cases**:

- Draw corrections needed before re-publishing
- Event cancelled or postponed
- Major scheduling changes requiring republication
- Remove from public site while maintaining internal data

---

## unPublishEventSeeding

Removes seeding information from public visibility.

```js
engine.unPublishEventSeeding({
  eventId, // required
  stages, // optional - array of stages to unpublish
  removePriorValues, // optional boolean, defaults to true
});
```

### Examples

#### Unpublish All Seeding

```js
engine.unPublishEventSeeding({ eventId });
```

#### Unpublish Specific Stages

```js
engine.unPublishEventSeeding({
  eventId,
  stages: [stageConstants.MAIN, stageConstants.QUALIFYING],
});
```

**Use Cases**:

- Seeding corrections needed
- Change seeding methodology
- Remove seeding before draw changes

---

## unPublishOrderOfPlay

Removes Order of Play from public visibility.

```js
engine.unPublishOrderOfPlay({
  removePriorValues, // optional boolean, defaults to true
});
```

### Examples

```js
// Unpublish all schedules
engine.unPublishOrderOfPlay();

// Keep timeItems
engine.unPublishOrderOfPlay({
  removePriorValues: false,
});
```

**Use Cases**:

- Major scheduling changes
- Venue changes affecting schedule
- Weather delays requiring reschedule
- Remove from public pending updates

---

## unPublishParticipants

Removes participant list from public visibility.

```js
engine.unPublishParticipants({
  removePriorValues, // optional boolean, defaults to true
});
```

### Examples

```js
// Unpublish participants
engine.unPublishParticipants();
```

**Use Cases**:

- Entry deadline extended
- Major withdrawals requiring list update
- Corrections to participant information

---

## Integration Patterns

### Subscription-Based Publishing

```js
import { topicConstants } from 'tods-competition-factory';

const subscriptions = {
  [topicConstants.PUBLISH_EVENT]: async (payload) => {
    const { eventData, eventId } = payload;
    // Update public website
    await fetch('https://public-site.com/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  [topicConstants.PUBLISH_ORDER_OF_PLAY]: async (payload) => {
    const { dateMatchUps } = payload;
    // Update schedule displays
    await updateScheduleDisplay(dateMatchUps);
  },

  [topicConstants.UNPUBLISH_EVENT]: async (payload) => {
    const { eventId } = payload;
    // Remove from public site
    await removeFromPublicSite(eventId);
  },
};

engine.devContext({ subscriptions });
```

### Database Synchronization

```js
[topicConstants.PUBLISH_ORDER_OF_PLAY]: async (payload) => {
  const { dateMatchUps } = payload;
  await database.updatePublishedSchedule(dateMatchUps);
  cache.invalidate('schedules');
}
```

### Cache Management

```js
[topicConstants.UNPUBLISH_EVENT]: (payload) => {
  const { eventId } = payload;
  cache.invalidate(`event:${eventId}`);
  cache.invalidate('published-events-list');
}
```

---

## Related Documentation

- **[Publishing Concepts](../concepts/publishing)** - Comprehensive workflows and best practices
- **[Time Items](../concepts/timeItems)** - How publish state is stored
- **[Subscriptions](/docs/engines/subscriptions)** - Notification system
- **[Query Governor](/docs/governors/query-governor)** - Methods using publish state
- **[Policies](../concepts/policies)** - Privacy and display policies
