---
name: API
title: Competition Engine API
---

## addCourts

Convenience function to bulk add courts to a Venue. Only adds **dataAvailability** and **courtName**.

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

## attachPolicy

Attaches a `policyDefinition` to all tournamentRecords currently loaded into `competitionEngine`.

```js
competitionEngine.attachPolicy({ policyDefinition });
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
  localTimeZone, // optional - used to convert scheduleDate
  localPerspective: true,
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
  eventEntriesOnly, // boolean
  participantTypes: [INDIVIDUAL],
  participantRoles, [COMPETITOR],
  signInStatus, // specific signIn status
  eventIds, // events in which participants appear
};
const { competitionParticipants } =
  competitionEngine.getCompetitionParticipants({
    inContext, // optional - adds individualParticipants for all individualParticipantIds
    withStatistics, // optional - adds events, machUps and statistics, e.g. 'winRatio'
    withOpponents, // optional - include opponent participantIds
    withMatchUps, // optional - include all matchUps in which the participant appears
    convertExtensions, // optional - BOOLEAN - convert extensions so _extensionName attributes
    policyDefinition, // optional - can accept a privacy policy to filter participant attributes
    participantFilters, // optional - filters
  });
```

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

Returns a deep copy of the current competitionEngine state.

```js
const { tournaentRecords } = competition.getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
});
```

---

## getSchedulingProfile

```js
const { schedulingProfile } = competitionEngine.getSchedulingProfile();
```

---

## getVenuesAndCourts

Returns an aggregate view of venues and courts across all tournamentRecords loaded into `competitionEngine`.

```js
const { courts, venues } = competitionEngine.getVenuesAndCourts();
```

---

## isValidSchedulingProfile

```js
const isValid = competitionEngine.isValidSchedulingProfile({
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
          date: '2020-01-01',
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
  date,
  startTime, // optional - if not provided will be derived from court availability for the tiven date
  endTime, // optional - if not provided will be derived from court availability for the tiven date
  venueIds, // optional - defaults to all known; if a single venueId is provided then all matchUps will be scheduled for that venue
  matchUpIds, // array of matchUpIds; if no schedulingProfile provided will be auto-sorted by draw size and roundNumbers
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
competitionEngine.scheduleProfileRounds({
  scheduleDates, // optional array of dates to schedule
  periodLength = 30, // optional - size of scheduling blocks

  checkPotentialConflicts, // boolean - defaults to true - consider individual requests when matchUp participants are "potential"
});
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

```js
const tournamentRecords = [tournamentRecord];
// or const tournamentRecords = { [tournamentId]: tournamentRecord }

competitionEngine.setsState(tournamentRecords, deepCopy);
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
