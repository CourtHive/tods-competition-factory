---
title: Query Governor
---

```js
import { governors: { queryGovernor }} from 'tods-competition-factory';
```

## allDrawMatchUps

Returns all matchUps from all structures within a draw.

```js
const { matchUps } = engine.allDrawMatchUps({
  participantsProfile, // optional - ability to specify additions to context (see parameters of getParticipants())
  contextFilters, // filters based on context attributes
  matchUpFilters, // attribute filters
  nextMatchUps, // optioanl - boolean - to include winnerTo and loserTo
  inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
  context, // optional context to be added into matchUps
  drawId,
});
```

---

## allEventMatchUps

Returns all matchUps for an event.

```js
const { matchUps } = allEventMatchUps({
  participantsProfile, // optional - ability to specify additions to context (see parameters of getParticipants())
  scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  matchUpFilters, // optional; [ scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  contextFilters, // filters based on context attributes
  nextMatchUps: true, // include winner/loser target matchUp details
  inContext: true, // include contextual details
  eventId,
});
```

---

## allTournamentMatchUps

Return an array of all matchUps contained within a tournament. These matchUps are returned **inContext**.

```js
const { matchUps, groupInfo } = engine.allTournamentMatchUps({
  scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  participantsProfile, // optional - ability to specify additions to context (see parameters of getParticipants())
  matchUpFilters, // optional; [ scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  contextFilters, // filters based on context attributes
  nextMatchUps, // include winnerTo and loserTo matchUps
  contextProfile, // optional: { inferGender: true, withCompetitiveness: true, withScaleValues: true, exclude: ['attribute', 'to', 'exclude']}
});
```

---

## getCompetitionDateRange

```js
const { startDate, endDate } = competitionEngine.getCompetitionDateRange();
```

---

## getCompetitionPenalties

Returns an array of all penalties issued for all tournaments loaded into competitionEngine.

```js
const { penalties } = competitionEngine.getCompetitionPenalties();
```

---

## getCompetitionVenues

```js
const { venues, venueIds } = competitionEngine.getCompetitionVenues();
```

---

## getEventMatchUpFormatTiming

Method is used internally in advanced scheduling to determine averageMatchUp times for matchUps within an event.

Requires an array of `matchUpFormats` either be defined in scoring policy that is attached to the tournamentRecord or an event, or passed in as parameter. `matchUpFormats` can be passed either as an array of strings, or an array of `[{ matchUpFormat }]`.

```js
const { eventMatchUpFormatTiming } = competitionEngine.getEventMatchUpFormatTiming({
  matchUpFormats, // optional - can be retrieved from policy
  categoryType, // optional - categoryType is not part of TODS or event attributes, but can be defined in a policy
  eventId,
});
```

---

## getLinkedTournamentIds

Returns `linkedTournamentIds` for each tournamentRecord loaded in `compeitionEngine`.

Caters for the possibility that, for instance, two "linked" tournaments and one "unlinked" tournament could be loaded.

```js
const { linkedTournamentIds } = competitionEngine.getLinkedTournamentIds();
/*
{
  'tournamentId-1': ['tournamentId-2', 'tournamentId-3'],
  'tournamentId-2': ['tournamentId-1', 'touranmentId-3'],
  'tournamentId-3': ['tournamentId-1', 'tournamentId-2']
}
*/
```

---

## getMatchUpDailyLimits

Returns player daily match limits for singles/doubles/total matches.

```js
const { matchUpDailyLimits } = competitionEngine.getMatchUpDailyLimits({
  tournamentId, // optional - scope search to specific tournamentRecord
});
const { DOUBLES, SINGLES, total } = matchUpDailyLimits;
```

---

## getMatchUpDependencies

For each `matchUpId` returns an array of other `matchUpIds` which occur earlier in the draw.

Optionally returns an array of `participantIds` which could potentially appear in each `matchUp`;
used internally to ensure that auto scheduling respects the `timeAfterRecovery` of all potential participants.

```js
const {
  matchUpDependencies: {
    [matchUpId]: {
      matchUpIds: [matchUpIdDependency], // array of all matchUpIds which occur prior to this matchUpId in the draw; crosses all structures
      participantIds: [potentialParticipantIds], // array of all participantIds which could potentially appear in this matchUp
      dependentMatchUpIds: [dependentMatchUpId], // array of matchUpIds which occur after this matchUpId in the draw; crosses all structures
    },
  },
} = competitionEngine.getMatchUpDependencies({
  includeParticipantDependencies, // boolean - defaults to false
  drawIds, // optional array of drawIds to scope the analysis
});
```

---

## getRounds

Returns all rounds of all `structures` in all `tournamentRecords`.

```js
const { rounds, excludedRounds } = competitionEngine.getRounds({
  excludeScheduleDateProfileRounds, // optional date string - exclude rounds which appear in schedulingProfile on given date
  excludeCompletedRounds, // optional boolean - exclude rounds where all matchUps are completed
  excludeScheduledRounds, // optional boolean - exclude rounds where all matchUps are scheduled
  inContextMatchUps, // optional - if not provided will be read from tournamentRecords
  schedulingProfile, // optional - if not provided will be read from tournamentRecords (where applicable)
  withSplitRounds, // optional boolean - read schedulingProfile and split rounds where defined
  matchUpFilters, // optional - filter competition matchUps before deriving rounds
  withRoundId, // optional boolean - return a unique id for each derived round
  scheduleDate, // optional - filters out events which are not valid on specified date
  venueId, // optional - filters out events which are not valid for specified venue
  context, // optional - object to be spread into derived rounds
});
```

Returns the following detail for each round:

```js
  {
    roundSegment: { segmentsCount, segmentNumber }, // if the round has been split in schedulingProfile
    winnerFinishingPositionRange,
    unscheduledCount,
    incompleteCount,
    minFinishingSum,
    matchUpsCount,
    stageSequence,
    segmentsCount, // when { withSplitRounds: true } and a round split is defined in schedulingProfile
    structureName,
    tournamentId,
    isScheduled, // whether every matchUp in the round has been scheduled (does not consider matchUpStatus: BYE)
    isComplete, // whether every matchUp in the round has been COMPLETED or ABANDONED/CANCELLED
    matchUpType,
    roundNumber,
    structureId,
    eventName,
    roundName,
    drawName,
    matchUps,
    byeCount
    eventId,
    drawId,
    id, // unique id provided when { withRoundId: true }
  } = round;
```

---

## getCompetitionParticipants

Returns **deepCopies** of competition participants filtered by participantFilters which are arrays of desired participant attribute values. This method is an optimization of `getCompetitionParticipants` and will replace it going forward.

```js
const participantFilters = {
  accessorValues: [{ accessor, value }], // optional - see Accessors in Concepts
  eventEntryStatuses, // boolean
  participantTypes: [INDIVIDUAL],
  participantRoles, [COMPETITOR],
  signInStatus, // specific signIn status
  eventIds, // events in which participants appear
};
const {
  participantIdsWithConflicts, // returns array of participantIds which have scheduling conflicts
  competitionParticipants,
  eventsPublishStatuses,
  derivedEventInfo,
  derivedDrawInfo,
  participantsMap, // object { [participantId]: participant }
  mappedMatchUps, // object { [matchUpId]: matchUp }; when { withMatchUps: true }
  participants, // array of participants
  matchUps, // array of all matchUps; when { withMatchUps: true }
} =
  competitionEngine.getCompetitionParticipants({
    convertExtensions, // optional - BOOLEAN - convert extensions so _extensionName attributes
    participantFilters, // optional - filters
    policyDefinitions, // optional - can accept a privacy policy to filter participant attributes
    usePublishState, // optional - BOOLEAN - don't add seeding information when not published
    scheduleAnalysis: {
      scheduledMinutesDifference // optional - scheduling conflicts determined by scheduledTime difference between matchUps
    },
    usePublishState,  // optional boolean
    withDraws, // optional - defaults to true if any other context options are specified
    withEvents, // optional - defaults to true if any other context options are specified
    withGroupings, // optional - include membership in group, pair, and team participants
    withIndividualParticipants, // optional - boolean or attributeFilter template - include hydrated individualParticiapnts for TEAM/PAIR participants
    withIOC, // optional - will add IOC country code and countryName to participant persons
    withISO2, // optional - will add ISO2 country code and countryName to participant persons
    withMatchUps, // optional - include all matchUps in which the participant appears, as well as potentialMatchUps
    withOpponents, // optional - include opponent participantIds
    withPotentialMatchUps, // optional boolean
    withRankingProfile, // optional boolean - include details necessary for point awards
    withScaleValues, // optional - include { ratings, rankings } attributes extracted from timeItems
    withSeeding, // optionsl - add event seeding
    withScheduleItems, // optional boolean - include array of scheduled matchUp details
    withSignInStatus, // optional boolean
    withStatistics, // optional - adds events, matchUps and statistics, e.g. 'winRatio'
    withTeamMatchUps // optional boolean
  });
```

### participantFilters

- enableOrFiltering: boolean - use OR logic instead of default AND
- accessorValues: array of accessors and targeted value `[{ accessor, value }]`
- drawEntryStatuses: array of `entryStatus` values for participantIds found in draw.entries
- eventEntryStatuses: array of `entryStatus` values for participantIds found in event.entries
- eventIds: array of targeted eventIds
- participantIds: array of targeted participantIds
- participantRoles: array of targeted participantRoles
- participantTypes: array of targeted participantTypes
- positionedParticipants: participantIds positioned in structures `[true, false, undefined]`
- signInStatus: SIGNED_IN or SIGNED_OUT

---

## getParticipantScaleItem

Return a ranking or rating or seeding value for a participant, referenced by participantId.

See [Scale Items](../concepts/scaleItems).

```js
const scaleAttributes = {
  scaleType: RATING,
  eventType: SINGLES,
  scaleName: 'WTN',
  accessor, // optional - string determining how to access attribute if scaleValue is an object
};
const {
  scaleItem: { scaleValue },
  tournamentId,
} = competitionEngine.getParticipantScaleItem({
  scaleAttributes,
  participantId,
});
```

---

## getPersonRequests

Returns an object with array of requests for each relevant `personId`. Request objects are returned with a `requestId` which can be used to call [modifyPersonRequests](competition-engine-api#modifypersonrequests).

See [addPersonRequests](competition-engine-api#addpersonrequests) for request object structure.

```js
const { personRequests } = competitionEngine.getPersonRequests({
  requestType, // optional filter
});
```

---

## getState

Returns a deep copy of `tournamentRecords` which have been loaded, along with currently selected `tournamentId`.

:::note
`competitionEngine` and `tournamentEngine` share state; `tournamentId` points to the `tournamentRecord` that
`tournamentEngine` methods will mutate.
:::

```js
const { tournamentId, tournamentRecords } = competitionEngine.getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
  removeExtensions, // optional - strip all extensions out of tournamentRecord
});
```

---

## getSchedulingProfile

Returns a `schedulingProfile` (if present). Checks the integrity of the profile to account for any `venues` or `drawDefinitions` which have been deleted.

```js
const { schedulingProfile } = competitionEngine.getSchedulingProfile();
```

---

## getSchedulingProfileIssues

Analyzes the `schedulingProfile` (if any) that is attached to the `tournamentRecord(s)` and reports any issues with the ordering of rounds.

The analysis for each `scheduleDate` only includes `matchUps` to be scheduled on that date.
In other words, the method only reports on scheduling issues relative to the group of `matchUpIds` derived from rounds which are being scheduled for each date.

:::note
In some cases it is valid to schedule a second round, for instance, before a first round, because there may be some second round `matchUps` which are ready to be played... possibly due to `participants` advancing via first round BYEs or WALKOVERs.

Regardless of issues reported, `competitionEngine.scheduleProfileRounds()` will attempt to follow the desired order, but will not schedule `matchUps` before dependencies.
:::

```js
const {
  profileIssues: {
    // object includes matchUpIds which are out of order
    matchUpIdsShouldBeAfter: {
      [matchUpId]: {
        earlierRoundIndices: [index], // indices of scheduled rounds which must be scheduled before matchUpId
        shouldBeAfter: [matchUpId], // array of matchUpIds which must be scheduled before matchUpId
      },
    },
  },
  // roundIndex is the index of the round to be scheduled within the schedulingProfile for a givn date
  roundIndexShouldBeAfter: {
    [scheduleDate]: {
      [index]: [indexOfEarlierRound], // maps the index of the round within a date's scheduled rounds to those rounds which should be scheduled first
    },
  },
} = competitionEngine.getSchedulingProfileIssues({
  dates, // optional array of target dates
});
```

---

## generateBookings

This methods is used internally for creating a "virtual" view of court availability.

```js
const { bookings, relevantMatchUps } = competitionEngine.generateBookings({
  defaultRecoveryMinutes, // optional
  averageMatchUpMinutes, // optional
  periodLength, // optional - scheduling period in minutes
  scheduleDate, // optional - only consider matchUps scheduled on scheduleDate
  venueIds, // optional - only consider matchUps at specific venue(s)
  matchUps,
});
```

---

## getVenuesAndCourts

Returns an aggregate view of venues and courts across all tournamentRecords loaded into `competitionEngine`.

```js
const { courts, venues } = competitionEngine.getVenuesAndCourts({
  convertExtensions, // optional boolean
  ignoreDisabled, // optional boolean
  dates, // optional - used with ignoreDisabled - applies to courts
});
```

---

## getVenuesReport

Returns a `venueReports` array which provides details for each targt `venue` for targt date(s).

```js
const { venuesReport } = competitionEngine.getVenuesReport({
  dates, // optional array of target dates
  venueIds, // optional array of target venueIds
  ignoreDisabled, // optional boolean, defaults to true - ignore disabled venues/courts
});

const {
  availableCourts, // how many courts are available for date
  availableMinutes, // total courts minutes available for date
  scheduledMinutes, // minutes of court time that are scheduled for matchUps
  scheduledMatchUpsCount, // number of scheduled matchUps
  percentUtilization, // percent of available minutes utilized by scheduled matchUps
} = venuesReport[0].venueReport[date];
```

---

## matchUpActions

Convenience pass through to `engine.matchUpActions` for use in contexts where multiple tournamentRecords are loaded into `competitionEngine`.

```js
const { matchUpActions } = competitionEngine.matchUpActions({
  tournamentId,
  matchUpId,
  eventId,
  drawId,
});
```

---

## validateSchedulingProfile

```js
const { valid, error } = competitionEngine.validateSchedulingProfile({
  schedulingProfile,
});
```
