---
name: API
title: Competition Engine API
---

All competitionEngine methods which make a mutation return either `{ success: true }` or `{ error }`

## addCourts

Convenience function to bulk add courts to a Venue. Only adds **dateAvailability** and **courtName**. See [Scheduling](/docs/concepts/scheduling).

```js
competitionEngine.addCourts({
  venueId,
  courtsCount: 3, // optional, can be added/modified later
  courtNames: ['Court 1', 'Court 2', 'Court 3'], // optional
  dateAvailability, // optional -- see definition in Tournament Engine API
});
```

---

## addDrawDefinition

Adds a drawDefinition to an event in a tournamentRecord.

```js
if (!error) {
  const result = competitionEngine.addDrawDefinition({
    tournamentId,
    eventId,
    drawDefinition,
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
  drawId,
  matchUpId,
  tournamentId,
  endTime,
  disableNotice, // when disabled subscribers will not be notified
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
competitionEngine.addVenue({ venue: { venueName } });
```

---

## allCompetitionMatchUps

```js
const { matchUps } = competitionEngine.allCompetitionMatchUps({
  scheduleVisibilityFilters,
  matchUpFilters, // optional; [ scheduledDate, scheduleDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  nextMatchUps, // include winnerTo and loserTo matchUps
});
```

---

## assignMatchUpCourt

```js
competitionEngine.assignMatchUpCourt({
  tournamentId,
  drawId, // drawId where matchUp is found
  matchUpId,
  courtId,
  courtDayDate, // ISO Date String or 'YYYY-MM-DD'
});
```

---

## assignMatchUpVenue

```js
competitionEngine.assignMatchUVenue({
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
const matchUpContextIds = [{ tournamentId, matchUpId }];
competitionEngine.bulkScheduleMatchUps({ matchUpContextIds, schedule });
```

## calculateScheduleTimes

Returns an array of available schedule times for a given date (and optional time range).

```js
const { scheduleTimes } = competitionEngine.calculateScheduleTimes({
  date,

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
  ignoreMatchUpStatuses, // optionally specify matchUpStatus values to be ignored
  scheduleAttributes, // optionally specify which attributes should be considered
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
  scheduleVisibilityFilters,
});
```

---

## competitionScheduleMatchUps

```js
const matchUpFilters = {
  isMatchUpTie: false,
  scheduledDate, // scheduled date of matchUps to return
};

const { completedMatchUps, dateMatchUps, courtsData, venues } =
  competitionEngine.competitionScheduleMatchUps({
    matchUpFilters,
    sortCourtsData, // boolean - optional
    sortDateMatchUps, // boolean - optional - defaults to `true`
  });
```

---

## deleteVenue

If a venue has scheduled matchUps then it will not be deleted unless `{ force: true }` in which case all relevant matchUps will be unscheduled.

```js
tournamentEngine.deleteVenue({ venueId, force });
```

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
competitionEngine.devContext(true);
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
    method: 'getCompetitionParticipants',
    params: { participantFilters: { participantTypes: [PAIR] } },
  },
  {
    method: 'getCompetitionParticipants',
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
const { participant } = competitionEngine.findParticipant({
  participantId,
  personId, // required only if no participantId provided
});
```

---

## getCompetitionDateRange

```js
const { startDate, endDate } = competitionEngine.getCompetitionDateRange();
```

---

## getCompetitionParticipants

Returns **deepCopies** of competition participants filtered by participantFilters which are arrays of desired participant attribute values.

```js
const participantFilters = {
  accessorValues,
  eventEntryStatuses, // boolean
  participantTypes: [INDIVIDUAL],
  participantRoles, [COMPETITOR],
  signInStatus, // specific signIn status
  eventIds, // events in which participants appear
};
const {
  competitionParticipants,
  participantIdsWithConflicts // returns array of participantIds which have scheduling conflicts
} =
  competitionEngine.getCompetitionParticipants({
    inContext, // optional - adds individualParticipants for all individualParticipantIds

    withStatistics, // optional - adds events, machUps and statistics, e.g. 'winRatio'
    withOpponents, // optional - include opponent participantIds
    withEvents, // optional - defaults to true
    withDraws, // optional - defaults to true
    withMatchUps, // optional - include all matchUps in which the participant appears, as well as potentialMatchUps

    scheduleAnalysis: {
      scheduledMinutesDifference // optional - scheduling conflicts determined by scheduledTime difference between matchUps
    },

    convertExtensions, // optional - BOOLEAN - convert extensions so _extensionName attributes
    policyDefinitions, // optional - can accept a privacy policy to filter participant attributes
    participantFilters, // optional - filters
  });
```

### Implemented participantFilters

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
    },
  },
} = competitionEngine.getMatchUpDependencies({
  includeParticipantDependencies, // boolean - defaults to false
  drawIds, // optional array of drawIds to scope the analysis
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

Returns a deep copy `tournamentRecords` which have been loaded, along with currently selected `tournamentId`.

:::note
`competitionEngine` and `tournamentEngine` share state; `tournamentId` points to the `tournamentRecord` that
`tournamentEngine` methods will mutate.
:::

```js
const { tournamentId, tournaentRecords } = competition.getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
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

## getVenuesAndCourts

Returns an aggregate view of venues and courts across all tournamentRecords loaded into `competitionEngine`.

```js
const { courts, venues } = competitionEngine.getVenuesAndCourts();
```

---

## getVenuesReport

Returns a `venueReports` array which provides details for each targt `venue` for targt date(s).

```js
const { venuesReport } = competitionEngine.getVenuesReport({
  dates, // optional array of target dates
  venueIds, // optional array of target venueIds
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

## isValidSchedulingProfile

```js
const { valid, error } = competitionEngine.isValidSchedulingProfile({
  schedulingProfile,
});
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
  eventId,
  drawId,
  matchUpId,
});
```

---

## matchUpScheduleChange

Swaps the schedule details of two scheduled matchUps.

```js
competitionEngine.matchUpScheduleChange({
  sourceMatchUpContextIds,
  targetMatchUpContextIds,
  sourceCourtId,
  targetCourtId,
  courtDayDate: dateSelected,
});
```

---

## modifyEventMatchUpFormatTiming

```js
competitionEngine.modifyEventMatchUpFormatTiming({
  eventId,
  matchUpFormat,
  averageMinutes,
  recoveryMinutes,
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

## modifyVenue

See [Scheduling](/docs/concepts/scheduling).

```js
const modifications = {
  venueName,
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
  drawId,
  matchUpId,
  tournamentId,
  courtDayDate,
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
  checkPotentialConflicts, // boolean - defaults to true - consider individual requests when matchUp participants are "potential"
});
```

---

## scheduleProfileRounds

Auto-schedules all rounds which have been specified in a `schedulingProfile` which has been saved to the tournamentRecord using `competitionEngine.setSchedulingProfile`.

```js
const result = competitionEngine.scheduleProfileRounds({
  scheduleDates, // optional array of dates to schedule
  periodLength = 30, // optional - size of scheduling blocks

  checkPotentialConflicts, // boolean - defaults to true - consider individual requests when matchUp participants are "potential"
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
  score,
  winningSide,
  matchUpStatus,
};

competitionEngine.setMatchUpStatus({
  drawId,
  matchUpId,
  tournamentId,
  matchUpTieId, // optional - if part of a TIE matchUp
  outcome,
  schedule: {
    // optional - set schedule items
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

:::info
By default a deep copy of the `tournamentRecords` is made so that mutations made by `competitionEngine` do not affect the source objects. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.
:::

:::note
`deepCopyConfig` is an object which configures `makeDeepCopy` for "internal use". In server configurations when `deepCopy` is FALSE and `tournamentRecords` are retrieved from Mongo, for instance, there are scenarios where nodes of the JSON structure contain prototypes which cannot be converted.
:::

```js
const tournamentRecords = [tournamentRecord];
// or const tournamentRecords = { [tournamentId]: tournamentRecord }

competitionEngine.setsState(tournamentRecords, deepCopy, deepCopyConfig);
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

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = competitionEngine.version();
```

---
