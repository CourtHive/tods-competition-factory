---
title: Publishing
---

## Overview

**Publishing** is the mechanism for controlling what tournament information is made publicly available and when. It provides fine-grained control over the visibility of draws, seeding, schedules, and participant data, while maintaining a complete internal record for tournament operations.

### Why Publishing Exists

Tournament organizers often need to control information release:

**Competitive Integrity**:

- Withhold seeding until draws are complete to prevent gaming
- Delay draw publication until all entries are finalized
- Embargo certain rounds until earlier rounds complete

**Operational Flexibility**:

- Prepare draws internally before public release
- Schedule matchUps without immediately making them visible
- Make corrections before information becomes public

**Privacy Protection**:

- Control which participant information is publicly visible
- Apply privacy policies to protect sensitive data
- Manage participant opt-outs and preferences

**Media Management**:

- Coordinate releases with media partners
- Stage information rollout for maximum engagement
- Control timing of seeding and draw announcements

### How Publishing Works

Publishing operates through **publish state management** tracked via [Time Items](./timeItems):

1. **Internal Operations**: Tournament staff work with complete data
2. **Publish Actions**: Administrators explicitly publish specific elements
3. **State Tracking**: Time items record what's published and when
4. **Filtered Queries**: Public-facing queries use `usePublishState: true` to filter data
5. **Notifications**: [Subscriptions](/docs/engines/subscriptions) notify systems when publishing changes

This architecture enables full operational capability internally while controlling external visibility precisely.

## Publish State Management

The factory tracks publish state for multiple tournament elements:

### Queryable Publish State

```js
const { publishState } = engine.getPublishState();

// Tournament-level state
const participantsPublished = publishState.tournament.participants.published;
const orderOfPlayPublished = publishState.tournament.orderOfPlay.published;

// Event-level state (accessed by eventId)
const eventState = publishState['eventId'].status;
const { published, publishedDrawIds, drawDetails } = eventState;

// Draw-level state
const drawState = engine.getPublishState({ drawId }).publishState;
const drawPublished = drawState.status.published;
const drawDetail = drawState.status.drawDetail; // stage/structure granularity
```

### State Granularity

Publishing can be controlled at multiple levels:

**Tournament Level**:

- Participant list visibility
- Order of Play (scheduled matchUps)

**Event Level**:

- All draws within an event
- Individual draws (flights) within an event
- Event seeding information

**Draw Level**:

- Entire draw structure
- Specific stages (MAIN, QUALIFYING, CONSOLATION)
- Individual structures within draws

**Structure Level**:

- Specific structures within multi-structure draws
- Round-by-round visibility (progressive release)

## Publishing Events and Draws

Event publishing controls visibility of draw structures, matchUps, and results.

### Publishing All Draws

Publish all draws within an event:

```js
const { eventData } = engine.publishEvent({ eventId });

// eventData contains formatted payload for public display
// publishState updated with timeItem
// Subscribers notified via PUBLISH_EVENT topic
```

### Publishing Specific Draws

Publish only selected draws (useful for flights):

```js
// Shorthand for publishing specific drawIds
engine.publishEvent({
  eventId,
  drawIdsToAdd: ['drawId1', 'drawId2'],
});

// Remove draws from published set
engine.publishEvent({
  eventId,
  drawIdsToRemove: ['drawId3'],
});
```

### Publishing by Stage

Publish only specific stages within a draw:

```js
import { stageConstants } from 'tods-competition-factory';
const { QUALIFYING, MAIN } = stageConstants;

// Publish only qualifying stage
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      stagesToAdd: [QUALIFYING],
    },
  },
});

// Publish MAIN and QUALIFYING
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      stagesToAdd: [MAIN, QUALIFYING],
      publishingDetail: { published: true },
    },
  },
});
```

### Round-by-Round Publishing

Control visibility round-by-round for progressive disclosure:

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

// Expand to include more rounds as they complete
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: {
          roundLimit: 2, // Now show rounds 1 and 2
          published: true,
        },
      },
    },
  },
});
```

### Publishing with Embargo

Schedule future publication with embargo timestamps:

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

### Unpublishing Events

Remove events from public visibility:

```js
engine.unPublishEvent({
  eventId,
  removePriorValues: true, // Remove timeItems (default)
});
```

## Publishing Event Seeding

Seeding publication is separate from draw publication, allowing flexible control over when seeding information becomes public.

### Why Separate Seeding Publication?

- **Competition Integrity**: Prevent participants from knowing their seeded positions before draws finalized
- **Draw Process**: Complete seeding internally before public announcement
- **Flexibility**: Update seeding without re-publishing entire draw
- **Staged Release**: Announce seeded players separately from draw structure

### Publishing Seeding

```js
engine.publishEventSeeding({
  eventId,
  seedingScaleNames: ['U18'], // Optional - specify which scales
  drawIds: ['drawId1'], // Optional - specific draws only
});

// Different scales for different stages
engine.publishEventSeeding({
  eventId,
  stageSeedingScaleNames: {
    MAIN: 'U18',
    QUALIFYING: 'U18Q',
  },
});
```

### Unpublishing Seeding

```js
engine.unPublishEventSeeding({
  eventId,
  stages: ['MAIN', 'QUALIFYING'], // Optional - specific stages only
});
```

## Publishing Order of Play

Order of Play publishing controls visibility of scheduled matchUps - which matches are scheduled for which courts and times.

### Why Order of Play Publishing?

- **Schedule Preparation**: Prepare schedules internally before announcing
- **Flexibility**: Make scheduling changes before public release
- **Coordination**: Synchronize releases with media partners
- **Daily Updates**: Publish each day's schedule separately

### Publishing Scheduled MatchUps

```js
// Publish all scheduled dates and events
engine.publishOrderOfPlay();

// Publish specific dates only
engine.publishOrderOfPlay({
  scheduledDates: ['2024-06-15', '2024-06-16'],
});

// Publish specific events only
engine.publishOrderOfPlay({
  eventIds: ['singles-main', 'doubles-main'],
});

// Publish specific dates and events
engine.publishOrderOfPlay({
  scheduledDates: ['2024-06-15'],
  eventIds: ['singles-main'],
  removePriorValues: true, // Clear previous publications
});
```

### Unpublishing Order of Play

```js
engine.unPublishOrderOfPlay({
  removePriorValues: true, // Remove timeItems (default)
});
```

### Querying Published Schedules

```js
const { dateMatchUps } = engine.competitionScheduleMatchUps({
  usePublishState: true, // Only return published matchUps
});

// dateMatchUps organized by date, filtered by publish state
// Only matchUps on published dates in published events returned
```

## Publishing Participants

Participant publishing controls visibility of the participant list.

### Why Participant Publishing?

- **Entry Management**: Accept entries internally before announcing participant list
- **Privacy**: Control when participant information becomes public
- **Marketing**: Coordinate announcements with promotional campaigns
- **Staged Entries**: Announce wildcards separately from direct acceptances

```js
engine.publishParticipants();

// Clear previous publications and republish
engine.publishParticipants({
  removePriorValues: true,
});
```

### Unpublishing Participants

```js
engine.unPublishParticipants({
  removePriorValues: true,
});
```

## Privacy Policies

Publishing integrates with **privacy policies** to control which participant attributes are visible:

### Participant Privacy Policy

```js
import { policyConstants } from 'tods-competition-factory';

const privacyPolicy = {
  participant: {
    contacts: false, // Hide contact information
    addresses: false, // Hide addresses
    individualParticipants: {
      // For pairs/teams
      contacts: false,
      addresses: false,
    },
  },
};

// Apply privacy policy during publishing
const { eventData } = engine.publishEvent({
  eventId,
  policyDefinitions: { [policyConstants.POLICY_TYPE_PARTICIPANT]: privacyPolicy },
});

// Participant data in eventData respects privacy policy
// Internal operations still have access to complete data
```

### Display Settings

Control visibility of specific matchUp and schedule attributes:

```js
const displaySettings = {
  matchUps: {
    scheduleDate: true,
    scheduledTime: false, // Hide specific times
    courtName: true,
    courtOrder: false,
  },
  participants: {
    addresses: false,
    contacts: false,
  },
};

engine.setEventDisplay({
  eventId,
  displaySettings,
});

// Settings applied when usePublishState: true in queries
```

## Data Preparation for Publishing

Publishing methods prepare optimized data payloads for public display.

### Event Data Payload

```js
const { eventData } = engine.publishEvent({
  eventId,
  eventDataParams: {
    allParticipantResults: true, // Include round statistics
    participantsProfile: {
      withISO2: true, // Include country codes
      withIOC: true,
    },
  },
});

// eventData structure optimized for visualization:
// - drawsData: Array of draws with structures
// - matchUps: Organized by rounds for each structure
// - participants: Hydrated participant information
// - venuesData: Venue and court information
// - tournamentInfo: Tournament metadata
```

:::important
**Event Data Parameters Are Not Persisted**

The `eventDataParams` passed to `publishEvent()` are used to generate the `eventData` payload **for that specific call only**. These parameters are **NOT stored** in the publish state timeItem.

**Client applications must pass their own query parameters:**

```js
// Server-side publishing (generates payload for subscriptions)
engine.publishEvent({
  eventId,
  eventDataParams: { participantsProfile: { withISO2: true } },
});

// Client application querying published data
const { eventData } = engine.getEventData({
  eventId,
  usePublishState: true, // Respects what's published
  participantsProfile: { withISO2: true }, // Must specify params again
});
```

The publish state timeItem controls **filtering** (which draws, structures, rounds are visible) but does not store query customization parameters. Each client application specifies its own data requirements when querying.
:::

### Prepared Payload Structure

```typescript
{
  eventData: {
    eventInfo: {
      eventId: string;
      eventName: string;
      // ... event metadata
    },
    drawsData: [{
      drawId: string;
      drawName: string;
      structures: [{
        structureId: string;
        structureName: string;
        roundMatchUps: {
          [roundNumber]: matchUp[]
        }
      }]
    }],
    participants: Participant[],
    venuesData: Venue[],
    tournamentInfo: TournamentInfo
  }
}
```

## Subscriptions and Notifications

Publishing actions trigger **subscription notifications** enabling real-time updates to public-facing systems.

### Publishing Topics

```js
import { topicConstants } from 'tods-competition-factory';

const subscriptions = {
  [topicConstants.PUBLISH_EVENT]: (payload) => {
    // Event published - update public website
    const { eventData, eventId } = payload;
    updatePublicSite(eventData);
  },

  [topicConstants.UNPUBLISH_EVENT]: (payload) => {
    // Event unpublished - remove from public website
    const { eventId } = payload;
    removeFromPublicSite(eventId);
  },

  [topicConstants.PUBLISH_EVENT_SEEDING]: (payload) => {
    // Seeding published - update seeding displays
    const { eventId, seedingData } = payload;
    updateSeedingDisplay(seedingData);
  },

  [topicConstants.UNPUBLISH_EVENT_SEEDING]: (payload) => {
    // Seeding unpublished - remove seeding information
    const { eventId } = payload;
    removeSeedingDisplay(eventId);
  },

  [topicConstants.PUBLISH_ORDER_OF_PLAY]: (payload) => {
    // Order of Play published - update schedule displays
    const { dateMatchUps } = payload;
    updateScheduleDisplay(dateMatchUps);
  },

  [topicConstants.UNPUBLISH_ORDER_OF_PLAY]: (payload) => {
    // Order of Play unpublished - remove schedules
    removeScheduleDisplay();
  },
};

engine.devContext({ subscriptions });
```

### Integration Patterns

**Push to Public Website**:

```js
[topicConstants.PUBLISH_EVENT]: async (payload) => {
  const { eventData } = payload;
  await fetch('https://public-site.com/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
}
```

**Database Synchronization**:

```js
[topicConstants.PUBLISH_ORDER_OF_PLAY]: async (payload) => {
  const { dateMatchUps } = payload;
  await database.updatePublishedSchedule(dateMatchUps);
}
```

**Cache Invalidation**:

```js
[topicConstants.UNPUBLISH_EVENT]: (payload) => {
  const { eventId } = payload;
  cache.invalidate(`event:${eventId}`);
}
```

## Common Workflows

### Progressive Draw Publication

Gradually release draw information as tournament progresses:

```js
// Day 1: Publish first round only
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: { roundLimit: 1, published: true },
      },
    },
  },
});

// Day 2: Expand to show rounds 1-2
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: { roundLimit: 2, published: true },
      },
    },
  },
});

// Day 3: Publish entire draw
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: { publishingDetail: { published: true } },
  },
});
```

### Multi-Stage Publication

Publish qualifying first, main draw later:

```js
import { stageConstants } from 'tods-competition-factory';

// Publish qualifying only
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      stagesToAdd: [stageConstants.QUALIFYING],
    },
  },
});

// Later: add main draw
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      stagesToAdd: [stageConstants.MAIN],
    },
  },
});
```

### Daily Order of Play

Publish each day's schedule separately:

```js
// Each morning, publish that day's schedule
const today = new Date().toISOString().split('T')[0];

engine.publishOrderOfPlay({
  scheduledDates: [today],
  removePriorValues: false, // Keep previous days published
});
```

### Coordinated Event and Seeding Release

Separate seeding announcement from draw publication:

```js
// Step 1: Announce seeded players
engine.publishEventSeeding({ eventId });
// Subscription notification sent
// Public site shows seeded players without draw

// Step 2: Later, publish draw
engine.publishEvent({ eventId });
// Subscription notification sent
// Public site shows complete draw with seeding
```

## Querying with Publish State

Methods that respect publish state when `usePublishState: true`:

### Event Data

```js
const { eventData } = engine.getEventData({
  eventId,
  usePublishState: true, // Filter to published draws/structures only
});
```

### Competition Schedule

```js
const { dateMatchUps } = engine.competitionScheduleMatchUps({
  usePublishState: true, // Only published dates and events
});
```

### Participants

```js
const { participants } = engine.getParticipants({
  usePublishState: true, // Respect privacy policies
  policyDefinitions: privacyPolicy,
});
```

## Best Practices

### Clear Separation

Maintain clear separation between internal and public-facing queries:

```js
// Internal operations - full data access
const { matchUps } = engine.allTournamentMatchUps();

// Public displays - filtered data
const { matchUps: publicMatchUps } = engine.allTournamentMatchUps({
  usePublishState: true,
});
```

### Test Publish State

Verify filtering works before going live:

```js
// Publish event
engine.publishEvent({ eventId });

// Query what public will see
const { eventData } = engine.getEventData({
  eventId,
  usePublishState: true,
});

// Verify expected structures/rounds visible
assert(eventData.drawsData.length === expectedCount);
```

### Atomic Publications

Use `removePriorValues: true` for clean state transitions:

```js
// Replace previous publication completely
engine.publishOrderOfPlay({
  scheduledDates: newDates,
  removePriorValues: true, // Clean slate
});
```

### Subscription Error Handling

Handle subscription failures gracefully:

```js
[topicConstants.PUBLISH_EVENT]: async (payload) => {
  try {
    await updatePublicSite(payload.eventData);
  } catch (error) {
    logger.error('Failed to update public site', error);
    // Queue for retry or alert administrators
  }
}
```

### Privacy by Default

Apply privacy policies consistently:

```js
const defaultPrivacyPolicy = {
  participant: {
    contacts: false,
    addresses: false,
    individualParticipants: {
      contacts: false,
      addresses: false,
    },
  },
};

// Attach to tournament for consistent application
engine.attachPolicies({
  policyDefinitions: {
    [policyConstants.POLICY_TYPE_PARTICIPANT]: defaultPrivacyPolicy,
  },
});
```

## Related Documentation

- **[Publishing Governor](/docs/governors/publishing-governor)** - Complete API reference
- **[Query Governor](/docs/governors/query-governor)** - Methods using publish state
- **[Subscriptions](/docs/engines/subscriptions)** - Notification topics
- **[Policies](./policies)** - Privacy and display policies
- **[Time Items](./timeItems)** - How publish state is stored
