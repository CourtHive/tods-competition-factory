---
title: competitionEngine API
---

All **_competitionEngine_** methods which make a mutation return either `{ success: true }` or `{ error }`

---

## addCourts

Convenience function to bulk add courts to a Venue. Only adds **dateAvailability** and **courtName**. See [Scheduling](/docs/concepts/scheduling).

```js
competitionEngine.addCourts({
  venueAbbreviationRoot, // optional boolean; whether to use venue.venueAbbreviation in court naming
  dateAvailability, // optional -- see definition in Tournament Engine API
  courtsCount: 3, // optional, can be added/modified later
  courtNameRoot, // optional; defaults to 'Court'
  courtNames: ['Court 1', 'Court 2', 'Court 3'], // optional
  venueId,
});
```

---

## addCollectionDefinition

Adds a `collectionDefinition` to the specified target, either `matchUp`, `structure`, `drawDefinition` or `event`.

```js
competitionEngine.addCollectionDefinition({
  updateInProgressMatchUps, // defaults to true; in progress matchUps have matchUpStatus: IN_PROGRESS
  collectionDefinition, // will be validated
  tieFormatName, // if not provided, existing tieFormatName will be deleted
  tournamentId, // required
  structureId, // optional - if provided only tieFormat on structure will be modified
  matchUpId, // optional - if provided only tieFormat on matchUp will be modified
  eventId, // optional - if provided only tieFormat on event will be modified
  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified
  uuids, // optional - array of UUIDs to use for newly created matchUps
});
```

---

## addCollectionGroup

```js
competitionEngine.addCollectionGroup({
  collectionIds: result.modifiedCollectionIds,
  tieFormatName: 'Swelled',
  groupDefinition,
  tournamentId, // required
  structureId, // optional - if provided only tieFormat on structure will be modified
  matchUpId, // optional - if provided only tieFormat on matchUp will be modified
  eventId, // optional - if provided only tieFormat on event will be modified
  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified
});
```

---

## addDrawDefinition

Adds a drawDefinition to an event in a tournamentRecord.

```js
if (!error) {
  const result = competitionEngine.addDrawDefinition({
    allowReplacement, // optional - defaults to false
    drawDefinition,
    tournamentId,
    eventId,
    flight, // optional - pass flight definition object for integrity check
  });
}
```

---

## addExtension

Adds an extension to all `tournamentRecords` loaded into `competitionEngine`.

```js
competitionEngine.addExtension({ extension });
```

---

## addMatchUpEndTime

```js
const endTime = '2020-01-01T09:05:00Z';
competitionEngine.addMatchUpEndTime({
  validateTimeSeries, // optional - true by default - when false does not verify endTime is later than startTime
  disableNotice, // when disabled subscribers will not be notified
  tournamentId,
  matchUpId,
  endTime,
  drawId,
});
```

---

## addMatchUpOfficial

```js
competitionEngine.addMatchUpOfficial({
  drawId,
  matchUpId,
  tournamentId,
  participantId,
  officialType,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpResumeTime

```js
const resumeTime = '2020-01-01T09:00:00Z';
competitionEngine.addMatchUpResumeTime({
  drawId,
  matchUpId,
  resumeTime,
  tournamentId,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpScheduledDate

```js
const scheduledDate = '2020-01-01';
competitionEngine.addMatchUpScheduledDate({
  drawId,
  matchUpId,
  tournamentId,
  scheduledDate,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpScheduledTime

```js
const scheduledTime = '08:00';
competitionEngine.addMatchUpScheduledTime({
  drawId,
  matchUpId,
  tournamentId,
  scheduledTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpScheduleItems

Convenience function to add several schedule items at once.

```js
competitionEngine.addMatchUpScheduleItems({
  drawId,
  matchUpId,
  tournamentId,
  schedule: {
    courtIds, // applies only to TEAM matchUps
    courtId, // requires scheduledDate
    venueId,
    scheduledTime,
    scheduledDate,
    startTime,
    endTime,
  },
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpStartTime

```js
const startTime = '2020-01-01T08:05:00Z';
competitionEngine.addMatchUpStartTime({
  drawId,
  matchUpId,
  startTime,
  tournamentId,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpStopTime

```js
const stopTime = '2020-01-01T08:15:00Z';
competitionEngine.addMatchUpStopTime({
  drawId,
  matchUpId,
  stopTime,
  tournamentId,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addPenalty

Add a penaltyItem to one or more participants.

```js
const createdAt = new Date().toISOString();
const penaltyData = {
  refereeParticipantId, // optional
  participantIds: [participantId],
  penaltyType: BALL_ABUSE,
  penaltyCode: 'Organization specific code', // optional
  matchUpId,
  issuedAt, // optional ISO timeStamp for time issued to participant
  createdAt,
  notes: 'Hit ball into sea',
};
let result = competitionEngine.addPenalty(penaltyData);
```

---

## addPersonRequests

Validates and adds person requests.

```js
const requests = [
  {
    date, // 'YYYY-MM-DD' date string
    startTime, // '00:00' time string
    endTime, // '00:00' time string
    requestType: 'DO_NOT_SCHEDULE',
  },
];
competitionEngine.addPersonRequests({ personId, requests });
```

---

## addSchedulingProfileRound

```js
competitionEngine.addSchedulingProfileRound({
  scheduleDate, // string date, e.g. '2022-01-01' or '2022-01-01T00:00'
  venueId, // id of the venue to which the round has been assigned
  round, // details of a round to be played on specified date
});
```

---

## addVenue

Adds **venueId** if not provided.

```js
competitionEngine.addVenue({
  venue: { venueName },
  context, // optional - adds detail in CONTEXT extension
});
```

---

## allocateTeamMatchUpCourts

```js
let result = competitionEngine.allocateTeamMatchUpCourts({
  removePriorValues, // optional boolean
  matchUpId,
  courtIds,
  drawId,
});
```

---

## allCompetitionMatchUps

```js
const { matchUps } = competitionEngine.allCompetitionMatchUps({
  scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  afterRecoveryTimes, // optional boolean; include participant recovery times for each matchUp
  matchUpFilters, // optional; [ scheduledDate, scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  nextMatchUps, // include winnerTo and loserTo matchUps
  contextProfile, // optional: { inferGender: true, withCompetitiveness: true, withScaleValues: true, exclude: ['attribute', 'to', 'exclude']}
});
```

---

## addMatchUpCourtOrder

When using Pro-scheduling, assign order on court

```js
competitionEngine.addMatchUpCourtOrder({
  removePriorValues, // optional boolean
  drawId, // drawId where matchUp is found
  tournamentId,
  courtOrder,
  matchUpId,
  courtId,
});
```

---

## assignMatchUpCourt

```js
competitionEngine.assignMatchUpCourt({
  removePriorValues, // optional boolean
  drawId, // drawId where matchUp is found
  courtDayDate, // ISO Date String or 'YYYY-MM-DD'
  tournamentId,
  matchUpId,
  courtId,
});
```

---

## assignMatchUpVenue

```js
competitionEngine.assignMatchUpVenue({
  removePriorValues, // optional boolean
  tournamentId,
  matchUpId,
  drawId, // drawId where matchUp is found
  venueId,
});
```

---

## attachPolicies

Attaches `policyDefinitions` to all tournamentRecords currently loaded into `competitionEngine`.

```js
competitionEngine.attachPolicies({ policyDefinitions });
```

---

## bulkMatchUpStatusUpdate

Provides the ability to update the outcomes of multiple matchUps at once.

```js
const outcomes = [
  {
    tournamentId,
    eventId,
    drawId,
    matchUpId,
    matchUpFormat,
    matchUpStatus,
    winningSide,
    score,
  },
];
competitionEngine.bulkMatchUpStatusUpdate({ outcomes });
```

---

## bulkRescheduleMatchUps

```js
const {
  rescheduled, // array of inContext matchUps which have been rescheduled
  notRescheduled, // array of inContext matchUps which have NOT been rescheduled
  allRescheduled, // boolean indicating whether all matchUps have been rescheduled
  dryRun, // boolean - only report what would happen without making modifications
} = competitionEngine.bulkRescheduleMatchUps({
  matchUpIds, // array of matchUupIds for matchUps which are to be rescheduled
  scheduleChange: {
    daysChange: 1, // number of days +/-
    minutesChange: 30, // number of minutes +/-
  },
});
```

---

## bulkScheduleMatchUps

```js
const schedule = {
  scheduledTime: '08:00',
  scheduledDate: '2021-01-01T00:00', // best practice to provide ISO date string
  venueId,
};
const matchUpDetails = [{ tournamentId, matchUpId, schedule }];
const matchUpContextIds = [{ tournamentId, matchUpId }];
competitionEngine.bulkScheduleMatchUps({
  checkChronology, // optional boolean - returns warnings for scheduling errors; throws errors when combined with errorOnAnachronism
  errorOnAnachronism, // optional boolean - throw error if chronological scheduduling error
  removePriorValues, // optional boolean - remove all pre-existing scheduling timeItems from matchUps
  matchUpContextIds, // optional - used together with matchUpIds when all matchUps will ahve the same schedule details applied
  matchUpDetails, // optional - for use when matchUps have different scheduling details
  schedule, // optiona - used together with matchUpIds when all matchUps will ahve the same schedule details applied
});
```

## calculateScheduleTimes

Returns an array of available schedule times for a given date (and optional time range).

```js
const { scheduleTimes } = competitionEngine.calculateScheduleTimes({
  scheduleDate,

  startTime, // optional - if not provided will be derived from court availability for the tiven date
  endTime, // optional - if not provided will be derived from court availability for the tiven date

  averageMatchUpMinutes = 90, // optional - defualts to 90
  periodLength = 30, // optional - defualts to 30

  venueIds, // optional - restrict calculation to specified venueIds
});
```

---

## clearScheduledMatchUps

```js
competitionEngine.clearScheduledMatchUps({
  ignoreMatchUpStatuses, // optional - specify matchUpStatus values to be ignored; defaults to all completed matchUpStatuses
  scheduleAttributes, // optional - specify which attributes should be considered; defaults to ['scheduledDate', 'scheduledTime']
  scheduledDates, // optional - array of dates to be cleared; only matchUps with specified scheduledDate will be cleared
  venueIds, // optional - array of venueIds; only matchUps at specified venues will be cleared
});
```

---

## competitionMatchUps

Returns aggregated arrays of "inContext" matchUps for all tournamentRecords loaded into `competitionEngine`.

```js
const {
  byeMatchUps,
  abandonedMatchUps,
  completedMatchUps,
  pendingMatchUps,
  upcomingMatchUps,
} = competitionEngine.competitionMatchUps({
  scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  matchUpFilters, // optional; [ scheduledDate, scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
});
```

---

## competitionScheduleMatchUps

```js
const matchUpFilters = {
  isMatchUpTie: false,
  scheduledDate, // scheduled date of matchUps to return
};

const { completedMatchUps, dateMatchUps, courtsData, groupInfo, venues } =
  competitionEngine.competitionScheduleMatchUps({
    alwaysReturnCompleted, // boolean - when true return completed matchUps regardless of publish state
    courtCompletedMatchUps, // boolean - include completed matchUps in court.matchUps - useful for pro-scheduling
    participantsProfile, // optional - ability to specify additions to context (see parameters of tournamentEngine.getParticipants())
    withCourtGridRows, // optional boolean - return { rows } of matchUps for courts layed out as a grid, with empty cells
    minCourtGridRows, // optional integer - minimum number of rows to return (compared to auto-calculated rows)
    sortDateMatchUps, // boolean boolean - optional - defaults to `true`
    usePublishState, // boolean - when true filter out events and dates that have not been published
    matchUpFilters, // optional; [ scheduledDate, scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
    sortCourtsData, // boolean - optional
  });
```

---

## courtGridRows

Method can be invoked by passing `({ withCourtGridRows: true })` to method `competitionEngine.competitionScheduledMatchUps`.

```js
const { rows } = competitionEngine.courtGridRows({
  minRowCount, // optional integer - minimum number of rows to return (compared to auto-calculated rows)
  courtsData, // produced by "competitionEngine.competitionScheduleMatchUps" method
});
```

---

## deleteCourt

```js
competitionEngine.deleteCourt({
  courtId,
  force, // override warnings about matchUps scheduled on specified court
});
```

---

## deleteVenue

If a venue has scheduled matchUps then it will not be deleted unless `{ force: true }` in which case all relevant matchUps will be unscheduled.

```js
competitionEngine.deleteVenue({ venueId, force });
```

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
competitionEngine.devContext(true);
```

---

## disableCourts

```js
competitionEngine.disableCourts({
  courtIds,
  dates, // optional - if not provided, courts will be disalbed for all dates
});
```

---

## disableTieAutoCalc

Disable default behavior of auto calculating TEAM matchUp scores.

```js
competitionEngine.disableTieAutoCalc({ tournamentId, drawId, matchUpId });
```

---

## disableVenues

```js
competitionEngine.disableVenues({ venueIds });
```

---

## enableCourts

```js
competitionEngine.enableCourts({
  enableAll, // optional boolean
  courtIds,
  dates, // optional - array of dates to enable (if they have been disabled)
});
```

---

## enableTiaAutoCalc

Re-enable default behavior of auto calculating TEAM matchUp scores, and trigger auto calculation.

```js
competitionEngine.enableTieAutoCalc({ tournamentId, drawId, matchUpId });
```

---

## enableVenues

```js
competitionEngine.enableVenues({ venueIds, enableAll });
```

---

## executionQueue

The `executionQueue` method accepts an array of `competitionEngine` methods and associated parameters,
allowing for multiple queries or mutations in a single API call, which is significant if a client is making a
request of a server and the server needs to prepare context by loading a tournament record.

An additional benefit of the `executionQueue` is that subscribers to `competitionEngine` events are not notified
until all methods in the queue have completed successfully, and a failure of any one method can be used to roll back state
with the assurance that there are no side-effects caused by subscribers responding to notifications. This also means
that the server context can not be blocked by any long-running external processes.

```js
const result = competitionEngine.executionQueue([
  {
    method: 'getParticipants',
    params: { participantFilters: { participantTypes: [PAIR] } },
  },
  {
    method: 'getParticipants',
    params: { participantFilters: { participantTypes: [INDIVIDUAL] } },
  },
]);
```

---

## findExtension

```js
const { extension } = competitionEngine.findExtension({ name });
```

---

## findParticipant

Find tournament participant by either `participantId` or `personId`.

```js
const { participant, tournamentId } = competitionEngine.findParticipant({
  participantId, // required only if no personId provided
  personId, // required only if no participantId provided
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
const { eventMatchUpFormatTiming } =
  competitionEngine.getEventMatchUpFormatTiming({
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

## getParticipants

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
  competitionEngine.getParticipants({
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

## linkTournaments

Links all tournaments currently loaded in `competitionEngine`.

```js
competitionEngine.linkTournaments();
```

---

## matchUpActions

Convenience pass through to `tournamentEngine.matchUpActions` for use in contexts where multiple tournamentRecords are loaded into `competitionEngine`.

```js
const { matchUpActions } = competitionEngine.matchUpActions({
  tournamentId,
  matchUpId,
  eventId,
  drawId,
});
```

---

## matchUpScheduleChange

Swaps the schedule details of two scheduled matchUps.

```js
competitionEngine.matchUpScheduleChange({
  courtDayDate: dateSelected,
  sourceMatchUpContextIds,
  targetMatchUpContextIds,
  sourceCourtId,
  targetCourtId,
});
```

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

## modifyCollectionDefinition

Modifies the `collectionName` and/or `matchUpFormat` for targeted `collectionId` within the `tieFormat` specified by `eventId`, `drawId`, `structureId` or `matchUpId`.

```js
competitionEngine.modifyCollectionDefinition({
  collectionName, // optional
  matchUpFormat, // optional
  tournamentId, // required
  collectionId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
  gender, // optional

  // value assignment, only one is allowed to have a value
  collectionValueProfiles, // optional - [{ collectionPosition: 1, value: 2 }] - there must be a value provided for all matchUp positions
  collectionValue, // optional - value awarded for winning more than half of the matchUps in the collection
  matchUpValue, // optional - value awarded for each matchUp won
  scoreValue, // optional - value awarded for each game or point won (points for tiebreak sets)
  setValue, // optional - value awarded for each set won
});
```

---

## modifyEventMatchUpFormatTiming

```js
competitionEngine.modifyEventMatchUpFormatTiming({
  recoveryMinutes,
  averageMinutes,
  matchUpFormat,
  eventId,
});
```

---

## modifyMatchUpFormatTiming

```js
competitionEngine.modifyMatchUpFormatTiming({
  matchUpFormat: 'SET3-S:6/TB7',
  averageTimes: [
    {
      categoryNames: [U12, U14],
      minutes: { [DOUBLES]: 110, default: 130 },
    },
    {
      categoryNames: [U16, U18],
      minutes: { [DOUBLES]: 100, default: 120 },
    },
  ],
  recoveryTimes: [
    { categoryNames: [], minutes: { default: 15, [DOUBLES]: 15 } },
  ],
});
```

---

## modifyPersonRequests

Modifies existing person requests.

Any requests without a `requestId` will be **added**. Any requests without `requestType` will be **removed**.

```js
competitionEngine.modifyPersonRequests({
  personId, // optional - scope to single personId; avoid brute-force updates
  requests: [
    {
      requestType,
      requestId, // if requestId is not present, will attempt to added
      startTime,
      endTime,
      date,
    },
  ],
});
```

---

## modifyPenalty

```js
const notes = 'Hit ball into spectator';
const modifications = { notes };
competitionEngine.modifyPenalty({ penaltyId, modifications });
```

---

## modifyTieFormat

Both modifies the `tieFormat` on the target `event`, `drawDefinition`, `structure` or `matchUp` and adds/deletes `tieMatchUps` as necessary.

```js
competitionEngine.modifyTieFormat({
  modifiedTieFormat, // will be compared to existing tieFormat that is targeted and differences calculated
  tournamentId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## modifyVenue

See [Scheduling](/docs/concepts/scheduling).

```js
const modifications = {
  venueName,
  onlineResources,
  venueAbbreviation,
  courts: [
    {
      courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
      courtName: 'Custom Court 1',
      dateAvailability: [
        {
          date: '2020-01-01', // if no date is provided then `startTime` and `endTime` will be considered default values
          startTime: '16:30',
          endTime: '17:30',
        },
      ],
    },
  ],
};
competitionEngine.modifyVenue({ venueId, modifications });
```

---

## orderCollectionDefinitions

Modify the array order of `tieFormat.collectionDefinitions` for an `event`, a `drawDefinition`, `structure`, or `matchUp`.

```js
competitionEngine.orderCollectionDefinitions({
  orderMap: { collectionId1: 1, collectionId2: 2 },
  tournamentId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## publishOrderOfPlay

```js
competitionEngine.publishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  scheduledDates, // optional - if not provided will publish all scheduledDates
  eventIds, // optional - if not provided will publish all eventIds
});
```

---

## removeCollectionDefinition

```js
competitionEngine.removeCollectionDefinition({
  updateInProgressMatchUps, // optional; defaults to true
  tieFormatComparison, // optional; defaults to false; when true will not delete unique collections on unscored matchUps
  tieFormatName, // any time a collectionDefinition is modified a new name must be provided
  tournamentId, // required
  collectionId, // required - id of collectionDefinition to be removed
  structureId, // optional - if removing from tieFormat associated with a specific structure
  matchUpId, // optional - if removing from tieFormat asscoiated with a specific matchUp
  eventId, // optional - if removing from tieFormat asscoiated with an event
  drawId, // required if structureId is specified or if tieFormat associated with drawDefinition is to be modified
});
```

---

## removeCollectionGroup

Removes a `collectionGroup` from the `tieFormat` found for the `event`, `drawDefinition`, `structure` or `matchUp`; recalculates

```js
competitionEngine.removeCollectionGroup({
  updateInProgressMatchUps, // optional - defaults to true
  tieFormatName: 'New tieFormat', // if no name is provided then there will be no name
  collectionGroupNumber: 1,
  tournamentId, // required
  structureId, // optional
  matchUpId, // optional
  eventId, // optional
  drawId, // optional; required if structureId is targeted
});
```

---

## removeEventMatchUpFormatTiming

```js
competitionEngine.removeEventMatchUpFormatTiming({ eventId });
```

---

## removeExtension

Removes an extension from all `tournamentRecords` loaded into `competitionEngine`.

```js
competitionEngine.removeExtension({ name });
```

---

## removeMatchUpCourtAssignment

```js
competitionEngine.removeMatchUpCourtAssignment({
  tournamentId,
  courtDayDate,
  matchUpId,
  drawId,
});
```

---

## removePersonRequests

Removes person requests matching passed values. If no paramaters are provided, removes **all** person requests.

```js
result = competitionEngine.removePersonRequests({
  personId, // optional - scope to personId
  requestType, // optioanl - scope to requestType
  requestId, // optional - scope to a single requestId
  date, // optional - scope to a specific date
});
```

---

## removePenalty

Removes a penalty from all relevant tournament participants.

```js
competitionEngine.removePenalty({ penaltyId });
```

---

## removeTournamentRecord

Removes a tournamentRecord from `competitionEngine` state.

```js
competitionEngine.removeTournamentRecord(tournamentId);
```

---

## removeUnlinkedTournamentRecords

Removes all tournamentRecords from `competitionEngine` state that are unlinked.

```js
competitionEngine.removeUnlinkedTournamentRecords();
```

---

## reorderUpcomingMatchUps

```js
const matchUpContextIds = [{ tournamentId, drawId, matchUpId }];
competitionEngine.reorderUpcomingMatchUps({
  matchUpContextIds,
  firstToLast, // boolean - direction of reorder
});
```

---

## resetScorecard

Removes all scores from `tieMatchUps` within a TEAM `matchUp`; preserves `lineUps`.

```js
competitionEngine.resetScorecard({
  tiebreakReset, // optional boolean - check for tiebreak scenarios and reset tieFormat
  tournamentId, // required
  matchUpId, // required - must be a TEAM matchUp
  drawId, // required
});
```

---

## resetTieFormat

Remove the `tieFormat` from a TEAM `matchUp` if there is a `tieFormat` further up the hierarchy; modifies `matchUp.tieMatchUps` to correspond.

```js
competitionEngine.resetTieFormat({
  tournamentId, // required
  matchUpId, // must be a TEAM matchUp
  drawId, // required
  uuids, // optional - in client/server scenarios generated matchUps must have equivalent matchUpIds
});
```

---

## scheduleMatchUps

Auto schedule matchUps on a given date using the Garman formula.

```js
competitionEngine.scheduleMatchUps({
  scheduleDate, // date string in the format `YYYY-MM-DD`
  startTime, // optional - if not provided will be derived from court availability for the tiven date
  endTime, // optional - if not provided will be derived from court availability for the tiven date
  venueIds, // optional - defaults to all known; if a single venueId is provided then all matchUps will be scheduled for that venue
  matchUpIds, // array of matchUpIds; if no schedulingProfile is present will be auto-sorted by draw size and roundNumbers
  periodLength = 30, // optional - size of scheduling blocks
  averageMatchUpMinutes = 90, // optional - defaults to 90
  recoveryMinutes = 0, // optional - amount of time participants are given to recover between matchUps
  matchUpDailyLimits, // optional - policy declaration; SINGLES, DOUBLES and total limits per individual participant
  checkPotentialRequestConflicts, // boolean - defaults to true - consider individual requests when matchUp participants are "potential"
});
```

---

## scheduleProfileRounds

Auto-schedules all rounds which have been specified in a `schedulingProfile` which has been saved to the tournamentRecord using `competitionEngine.setSchedulingProfile`.

:::note
SINGLES and DOUBLES `matchUps` will be scheduled, but not TEAM `matchUps`.
:::

```js
const result = competitionEngine.scheduleProfileRounds({
  checkPotentialRequestConflicts, // boolean - defaults to true - consider individual requests when matchUp participants are "potential"
  periodLength = 30, // optional - size of scheduling blocks
  clearScheduleDates, // optional - boolean: true to clear ALL dates, otherwise array of scheduleDates to clear
  scheduleDates, // optional array of dates to schedule
  dryRun, // boolean - only report what would happen without making modifications
  pro: // boolean - defaults to false; schedule specific courts without using garman
});

const {
  scheduledDates, // dates for which matchUps have been scheduled
  scheduledMatchUpIds, // array of matchUpIds which have been scheduled
  noTimeMatchUpIds, // array of matchUpids which have NOT been scheduled
  overLimitMatchUpIds, // matchUps not scheduled because of participant daily limits
  requestConflicts, // array of { date, conflicts } objects for each date in schedulingProfile
} = result;
```

---

## setMatchUpDailyLimits

```js
competitionEngine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 2, DOUBLES: 1, total: 3 },
  tournamentId, // optional - scope to a specific tournamentId
});
```

---

## setMatchUpStatus

Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object. Handles any winner/loser participant movements within or across structures.

```js
const outcome = {
  matchUpStatus, // optional
  winningSide, // optional
  score, // optional
};

competitionEngine.setMatchUpStatus({
  disableScoreValidation, // optional boolean
  allowChangePropagation, // optional boolean - allow winner/loser to be swapped and propgate change throughout draw structures
  disableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  enableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  tournamentId,
  matchUpTieId, // optional - if part of a TIE matchUp
  matchUpId,
  drawId,
  outcome, // optional
  schedule: {
    // optional - set schedule items
    courtIds, // optional - applies only to TEAM matchUps => creates .allocatedCourts
    courtId, // requires scheduledDate
    venueId,
    scheduledDate,
    scheduledTime,
    startTime,
    endTime,
  },
  notes, // optional - add note (string) to matchUp object
});
```

---

## setState

Loads tournament records into competitionEngine; supports both an array of tournamentRecords and an object with tournamentId keys.

```js
const tournamentRecords = [tournamentRecord];
// or const tournamentRecords = { [tournamentId]: tournamentRecord }

competitionEngine.setsState(tournamentRecords, deepCopy, deepCopyConfig);
```

:::info
By default a deep copy of the `tournamentRecords` is made so that mutations made by `competitionEngine` do not affect the source objects. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.
:::

:::note
`deepCopyConfig` is an optional configuration for `makeDeepCopy`. In server configurations when `deepCopy` is FALSE and `tournamentRecords` are retrieved from Mongo, for instance, there are scenarios where nodes of the JSON structure contain prototypes which cannot be converted.
:::

```js
const deepCopyConfig = {
  ignore, // optional - either an array of attributes to ignore or a function which processes attributes to determine whether to ignore them
  toJSON, // optional - an array of attributes to convert to JSON if the attribute in question is an object with .toJSON property
  stringify, // optional - an array of attributes to stringify
  modulate, // optional - function to process every attribute and return custom values, or undefined, which continues normal processing
};
```

---

## setSchedulingProfile

```js
competitionEngine.setSchedulingProfile({ schedulingProfile });
```

## setTournamentRecord

Adds a tournamentRecord to `competitionEngine` state, or overwrite/replace an existing `tournamentRecord` with the same `tournamentId`.

```js
competitionEngine.setTournamentRecord(tournamentRecord);
```

---

## toggleParticipantCheckInState

```js
competitionEngine.toggleParticipantCheckInState({
  drawId,
  matchUpId,
  tournamentId,
  participantId,
});
```

---

## unlinkTournament

Unlink the tournament specified by `tournamentId` from other tournaments loaded in `compeitionEngine`.

```js
competitionEngine.unlinkTournament({ tournamentId });
```

---

## unlinkTournaments

Removes links between all tournaments currently loaded in `competitionEngine`.

```js
competitionEngine.unlinkTournaments();
```

---

## unPublishOrderOfPlay

```js
competitionEngine.unPublishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
});
```

---

## updateTieMatchUpScore

Trigger automatic calculation of the score of a TEAM matchUp.

```js
competitionEngine.updateTieMatchUpScore({
  tournamentId,
  matchUpId,
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

---

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = competitionEngine.version();
```

---
