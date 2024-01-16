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

## allPlayoffPositionsFilled

Returns boolean value for whether playoff positions (which have been generated) are populated with `participantIds` or `BYEs`.

```js
const allPositionsFilled = engine.allPlayoffPositionsFilled({
  structureId,
  drawid,
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

## drawMatchUps

Returns categorized matchUps from all structures within a draw.

```js
const { upcomingMatchUps, pendingMatchUps, completedMatchUps, abandonedMatchUps, byeMatchUps } = engine.drawMatchUps({
  context, // optional context to be added into matchUps
  inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
  nextMatchUps, // optioanl - boolean - to include winnerTo and loserTo
  matchUpFilters, // attribute filters
  contextFilters, // filters based on context attributes
  tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
  requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
  tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
});
```

---

## eventMatchUps

Returns matchUps for an event grouped by status.

```js
const { abandonedMatchUps, byeMatchUps, completedMatchUps, pendingMatchUps, upcomingMatchUps } = engine.eventMatchUps({
  eventId,
  nextMatchUps, // optional boolean; include winner/loser target matchUp details
  matchUpFilters, // optional; [ scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  contextFilters,
  tournamentAppliedPolicies,
  scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  inContext: true, // optional - adds context details to all matchUps
});
```

---

## getAllEventData

Returns all `matchUps` for all draws in all events along with `tournamentInfo`, `eventInfo`, and `drawInfo`.

```js
const { allEventData } = engine.getAllEventData({
  policyDefinitions, // optional - allows participant data to be filtered via a privacy policy
});

const { tournamentInfo, eventsData, venuesData } = allEventData;
```

---

## getAllowedDrawTypes

Returns an array of names of allowed Draw Types, if any applicable policies have been applied to the tournamentRecord.

```js
const drawTypes = engine.getAllowedDrawTypes();
```

---

## getAllowedMatchUpFormats

Returns an array of TODS matchUpFormat codes for allowed scoring formats, if any applicable policies have been applied to the tournamentRecord.

```js
const drawTypes = engine.getAllowedMatchUpFormats();
```

---

## getAvailablePlayoffProfiles

If provided a `structureId`, returns rounds of the selected structure which are available for adding playoff structures.

```js
const { playoffRounds, playoffRoundsRanges, positionsPlayedOff } = engine.getAvailablePlayoffProfiles({
  structureId,
  drawId,
});
```

...for a SINGLE_ELIMINATION struture with `{ drawSize: 16 }` this would return:

```js
{
  playoffRounds: [ 1, 2, 3 ],
  playoffRoundsRanges: [
    { round: 1, range: '9-16' },
    { round: 2, range: '5-8' },
    { round: 3, range: '3-4' }
  ]
}
```

...for a ROUND_ROBIN struture with `{ drawSize: 16 }` and `{ groupSize: 4 }` this would return:

```js
{
    "finishingPositionsAvailable": [ 1, 2, 3, 4 ],
    "playoffFinishingPositionRanges": [
        {
            "finishingPosition": 1,
            "finishingPositions": [ 1, 2, 3, 4 ],
            "finishingPositionRange": "1-4"
        },
        {
            "finishingPosition": 2,
            "finishingPositions": [ 5, 6, 7, 8 ],
            "finishingPositionRange": "5-8"
        },
        {
            "finishingPosition": 3,
            "finishingPositions": [ 9, 10, 11, 12 ],
            "finishingPositionRange": "9-12"
        },
        {
            "finishingPosition": 4,
            "finishingPositions": [ 13, 14, 15, 16 ],
            "finishingPositionRange": "13-16"
        }
    ],
}
```

When no `structureId` is provided, returns an array of `availablePlayoffProfiles` with entries for each structure in a specified `drawDefinition`.

```js
const { availablePlayoffProfiles, positionsPlayedOff } = engine.getAvailablePlayoffProfiles({ drawId });
```

---

## getCheckedInParticipantIds

```js
const {
  allParticipantsCheckedIn, // boolean
  checkedInParticipantIds, // array of participantIds
} = engine.getCheckedInParticipantIds({ matchUp });
```

---

## getCompetitionDateRange

```js
const { startDate, endDate } = engine.getCompetitionDateRange();
```

---

## getCompetitionPenalties

Returns an array of all penalties issued for all tournaments loaded into engine.

```js
const { penalties } = engine.getCompetitionPenalties();
```

---

## getCompetitionVenues

```js
const { venues, venueIds } = engine.getCompetitionVenues();
```

---

## getCourtInfo

```js
const {
  altitude,
  courtId,
  courtName,
  courtDimensions,
  latitude,
  longitude,
  surfaceCategory,
  surfaceType,
  surfacedDate,
  pace,
  notes,
} = engine.getCourtInfo({ courtId });
```

---

## getCourts

Returns courts associated with a tournaments; optionally filter by venue(s).

```js
const { courts } = engine.getCourts({
  venueId, // optional - return courts for a specific venue
  venueIds, // optional - return courts for specified venues
});
```

---

## getDrawData

Primarily used by `getEventData` for publishing purposes.

```js
const {
  drawInfo: {
    drawActive, // boolean - draw has active matchUps
    drawCompleted, // boolean - all draw matchUps are complete
    drawGenerated, // boolean - draw has structures containing matchUps
    participantPlacements, // boolean - whether any participants have been placed in the draw
  },
  structures,
} = engine.getDrawData({ drawDefinition });
```

---

## getDrawParticipantRepresentativeIds

Get the participantIds of participants in the draw who are representing players by observing the creation of the draw.

```js
const { representativeParticipantIds } = engine.getDrawParticipantRepresentativeIds({
  drawId,
});
```

---

## getEligibleVoluntaryConsolationParticipants

```js
const { eligibleParticipants } = engine.getEligibleVoluntaryConsolationParticipants({
  excludedMatchUpStatuses, // optional - array of matchUpStatuses which are excluded from matchUpsLimit
  includeQualifyingStage, // optional - allow losers in qualifying
  finishingRoundLimit, // optional number - limits considered matchUps by finishingRound, e.g. 3 doesn't consider past QF
  roundNumberLimit, // optional number - limits matchUps by roundNumber
  matchUpsLimit, // optional number - limits the number of considered matchUps; works in tandem with excludedMatchUpStatuses
  winsLimit, // defaults to 0, meaning only participants with no wins are eligible
  requireLoss, // optional boolean - defaults to true; if false then all participants who have played and appear in MAIN draw are considered
  requirePlay, // optional boolean - defaults to true; if false then all participants who appear in MAIN draw are considered
  allEntries, // optional boolean - consider all entries, regardless of whether placed in draw
  includeEventParticipants, // optional boolean - consider event entries rather than draw entries (if event is present)
  drawId,
});
```

---

## getEntriesAndSeedsCount

```js
const { error, entries, seedsCount, stageEntries } = engine.getEntriesAndSeedsCount({
  policyDefinitions, // seeding policy which determines # of seeds for # of participants/drawSize
  eventId,
  drawSize, // optional - overrides number calculaed from entries in either event or draw
  drawId, // optional - scopes entries to a specific flight/drawDefinition
  stage, // optional - scopes entries to a specific stage
});
```

---

## getEntryStatusReports

```js
const {
  tournamentEntryReport: {
    nonParticipatingEntriesCount,
    individualParticipantsCount,
    drawDefinitionsCount,
    eventsCount,
  },
  entryStatusReports, // count and pct of total for all entryStatuses for each event
  participantEntryReports, // person entryStatus, ranking, seeding, WTN and confidence for each event
  eventReports, // primarily internal use - entries for each event with main/qualifying seeding
} = engine.getEntryStatusReports();
```

To export reports as CSV:

```js
const entryStatusCSV = utilities.JSON2CSV(entryStatusReports);
const personEntryCSV = utilities.JSON2CSV(participantEntryReports);
```

---

## getEvent

Get an event by either its `eventId` or by a `drawId` which it contains. Also returns `drawDefinition` if a `drawId` is specified.

```js
const {
  event,
  drawDefinition, // only returned if drawId is specified
} = engine.getEvent({
  eventId, // optional - find event by eventId
  drawId, // optional - find the event which contains specified drawId
});
```

---

## getEvents

Return **deepCopies** of all events in a tournament record.

```js
const { events } = engine.getEvents({
  withScaleValues, // optional boolean
  scaleEventType, // override event.eventType for accessing scales, e.g. SINGLES override for DOUBLES events
  inContext, // optional boolean hydrates with tournamentId
  eventIds, // optional array
  drawIds, // optional array
  context, // optional object to spread into all targeted events
});
```

---

## getEventData

Returns event information optimized for publishing: `matchUps` have context and separated into rounds for consumption by visualization libraries such as `tods-react-draws`.

See [Policies](../concepts/policies) for more details on `policyDefinitions`.

```js
const { eventData } = engine.getEventData({
  participantsProfile, // optional - ability to specify additions to context (see parameters of getParticipants())
  policyDefinitions, // optional
  usePublishState, // optional - filter out draws which are not published
  eventId,
});
const { drawsData, venuesData, eventInfo, tournamentInfo } = eventData;
```

---

## getEventTimeItem

```js
const { timeItem } = engine.getEventTimeItem({
  itemType: ADD_SCALE_ITEMS,
  itemSubTypes: [SEEDING], // optional
  eventId,
});
```

---

## getEventProperties

Gather attributes of events which come from other tournament elements, e.g. participants which have rankings/ratings/seedings for a given event.

```js
const { entryScaleAttributes, hasSeededParticipants, hasRankedParticipants, hasRatedParticipants } =
  engine.getEventProperties({ eventId });
```

... where **entryScaleAttributes** is an array of `{ participantId, participantName, seed, ranking, rating }`

---

## getEventMatchUpFormatTiming

Method is used internally in advanced scheduling to determine averageMatchUp times for matchUps within an event.

Requires an array of `matchUpFormats` either be defined in scoring policy that is attached to the tournamentRecord or an event, or passed in as parameter. `matchUpFormats` can be passed either as an array of strings, or an array of `[{ matchUpFormat }]`.

```js
const { eventMatchUpFormatTiming } = engine.getEventMatchUpFormatTiming({
  matchUpFormats, // optional - can be retrieved from policy
  categoryType, // optional - categoryType is not part of TODS or event attributes, but can be defined in a policy
  eventId,
});
```

---

## getEventStructures

```js
const { structures, stageStructures } = engine.getEventStructures({
  withStageGrouping: true, // optional return structures grouped by stages
  stageSequences, // optional - specify stageSequences to include
  stageSequence, // optional - filter by stageSequence
  stages, // optional - specify stageSequences to include
  stage, // optional - filter by stage
  eventId, // REQUIRED
});
```

---

## getFlightProfile

A `flightProfile` is an extension on an `event` detailing the parameters that will be used to generate `drawDefinitions` within the `event`. There is an array of `flights` which specify attributes of a draw such as `drawEntries, drawName, drawId, flightNumber` as well as `stage`, which is significant for flights which are only intended to reflect VOLUNTARY_CONSOLATION structures. A Voluntary Consolation flight is "linked" to the flight from which competitors originate and will be automatically deleted if the source flight is deleted.

If a `flight` has already been used to generate a draw, the `drawDefinition` will be returned with the profile.

```js
const { flightProfile } = engine.getFlightProfile({ eventId });
```

---

## getMatchUpCompetitiveProfile

Returns a categorization of a matchUp as "Competitive", "Routine" or "Decisive"

```js
const {
  competitiveness, // [COMPETITIVE, DECISIVE, ROUTINE]
  pctSpread, // 0-100 - rounded loser's percent of games required to win
} = engine.getMatchUpCompetitiveProfile({
  profileBands, // optional { [DECISIVE]: 20, [ROUTINE]: 50 } // can be attached to tournamentRecord as a policy
  matchUp,
});
```

---

## getMatchUpContextIds

Convenience method to find a `matchUp` by `matchUpId` and return "context ids". Does NOT require that drawEngine state be set, but does require an array of "inContext" `matchUps`.

```js
const { matchUpId, drawId, eventId, structureId, tournamentId } = engine.getMatchUpContextIds({
  matchUps,
  matchUpId,
});
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
} = engine.getMatchUpDependencies({
  includeParticipantDependencies, // boolean - defaults to false
  drawIds, // optional array of drawIds to scope the analysis
});
```

---

## getMatchUpFormat

Returns `matchUpFormat` codes for specified context(s). Refer to `getMatchUpFormat.test.js` for specfic use cases.

`matchUpFormat` for each matchUp is determined by traversing the hierarchy: `matchUp => stucture => drawDefinition => event`

```js
const { matchUpFormat, structureDefaultMatchUpFormat, drawDefaultMatchUpFormat, eventDefaultMatchUpFormat } =
  engine.getMatchUpFormat({
    eventId,
    drawId,
    structureId,
    matchUpId,
  });
```

---

## getMatchUpFormatTiming

Searches for policy definitions or extensions to determine the `averageMinutes` and `recoveryMinutes` for a given `matchUpFormat`. Extensions are considered to be overrides of policy definitions.

```js
const { averageMinutes, recoveryMinutes } = engine.getMatchUpFormatTiming({
  defaultAverageMinutes, // optional setting if no matching definition found
  defaultRecoveryMinutes, // optional setting if no matching definition found
  matchUpFormat,
  categoryName, // optional
  categoryType, // optional
  eventType, // optional - defaults to SINGLES; SINGLES, DOUBLES
  eventId, // optional - prioritizes policy definition attached to event before tournament record
});
```

---

## getMatchUpFormatTimingUpdate

Returns an array of methods/params necessary for updating a remote instance of a tournamentRecord to match a local instance. This method enables multiple "provisional" updates to be made on a local document without contacting a server; support deployments where a server is considered "master".

```js
const { methods } = engine.getMatchUpFormatTimingUpdate();
```

---

## getMatchUpScheduleDetails

Returns the latest values for all `matchUp.timeItems`, along with calculated values, that relate to the scheduling of a `matchUp`.

```js
const {
  schedule: {
    time,
    courtId,
    venueId,
    startTime,
    endTime,
    milliseconds,
    scheduledDate,
    scheduledTime,
    allocatedCourts: [{ venueId, courtid }], // applies only to TEAM matchUps
  },
} = engine.getMatchUpScheduleDetails({
  scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  matchUp,
});
```

---

## getMatchUpsStats

Returns percentages of matchUps which fall into `cmpetitiveBands` defined as "Competitive", "Routine", and "Decisive".

```js
const { competitiveBands } = engine.getMatchUpsStats({
  profileBands, // optional { [DECISIVE]: 20, [ROUTINE]: 50 } // can also be set in policyDefinitions
  matchUps,
});
```

---

## getMatchUpDailyLimits

Returns player daily match limits for singles/doubles/total matches.

```js
const { matchUpDailyLimits } = tournamentId.getMatchUpDailyLimits();
const { DOUBLES, SINGLES, total } = matchUpDailyLimits;
```

---

## getModifiedMatchUpFormatTiming

Returns `averageTimes` and `recoveryTimes` configuration objects for specified `matchUpFormat`. Useful before calling `modifyMatchUpFormatTiming` to preserve existing modifications.

```js
const { matchUpFormat, averageTimes, recoveryTimes } = engine.getModifiedMatchUpFormatTiming({
  matchUpFormat, // TODS matchUpFormat code
  event, // optional - include event in scope for search
});
```

---

## getPairedParticipant

Returns the `{ participantType: PAIR }`, if any, which contains the specified `individualParticipantIds`.

```js
const { participant } = engine.getPairedParticipant({
  participantIds: individualParticipantIds,
});
```

---

## getParticipantEventDetails

Returns an array of eventDetails in which a specified `participantId` appears. For details on draw entry within events use `engine.getParticipants({ inContext: true })`.

```js
const { eventDetails } = engine.getParticipantEventDetails({
  participantId,
});

const [{ eventName, eventId }] = eventDetails;
```

---

## getParticipantIdFinishingPositions

Returns the Range of finishing positions possible for all participantIds within a draw

```js
const idMap = engine.getParticipantIdFinishingPositions({
  byeAdvancements, // optional boolean - whether or not to consider byeAdvancements
  drawId,
});

const { relevantMatchUps, finishingPositionRanges, finishingPositionRange } = idMap['participantId'];
```

---

## getParticipantMembership

Returns all grouping participants which include `participantId` in `{ individualParticipantIds }`.

```js
const {
  [PAIR]: doublesParticipantIds,
  [GROUP]: groupParticipantIds,
  [TEAM]: teamParticipantIds,
} = engine.getParticipantMembership({
  participantId,
});
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
  participantsMap, // object { ['participantId']: participant }
  mappedMatchUps, // object { [matchUpId]: matchUp }; when { withMatchUps: true }
  participants, // array of participants
  matchUps, // array of all matchUps; when { withMatchUps: true }
 } =
  engine.getParticipants({
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

## getLinkedTournamentIds

Returns `linkedTournamentIds` for each tournamentRecord loaded in `compeitionEngine`.

Caters for the possibility that, for instance, two "linked" tournaments and one "unlinked" tournament could be loaded.

```js
const { linkedTournamentIds } = engine.getLinkedTournamentIds();
/*
{
  'tournamentId-1': ['tournamentId-2', 'tournamentId-3'],
  'tournamentId-2': ['tournamentId-1', 'touranmentId-3'],
  'tournamentId-3': ['tournamentId-1', 'tournamentId-2']
}
*/
```

---

## getPositionsPlayedOff

Determines which finishing positions will be returned by a draw. For example, a First Match Loser Consolation with a draw size of 16 will playoff possitions 1, 2, 9 and 10.

```js
const { positionsPlayedOff } = engine.getPositionsPlayedOff({
  drawDefinition,
});
```

---

## getRounds

Returns all rounds of all `structures` in all `tournamentRecords`.

```js
const { rounds, excludedRounds } = engine.getRounds({
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
} = engine.getParticipantScaleItem({
  scaleAttributes,
  participantId,
});
```

---

## getParticipantSchedules

```js
const { participantSchedules } = engine.getParticipantSchedules({
  participantFilters: { participantIds, participantTypes, eventIds },
});
```

---

## getParticipantSignInStatus

Participant signInStatus can be either 'SIGNED_IN' or 'SIGNED_OUT' (or undefined). See [modifyParticipantsSignInStatus](#modifyparticipantssigninstatus).

```js
const signInStatus = engine.getParticipantSignInStatus({
  participantId,
});
```

---

## getParticipantStats

```js
const result = engine.getParticipantStats({
  withCompetitiveProfiles, // optional boolean
  opponentParticipantId, // optional team opponent participantId, otherwise stats vs. all opponents
  withIndividualStats, // optional boolean
  teamParticipantId, // optional - when not provided all teams are processed
  tallyPolicy, // optional
  matchUps, // optional - specifiy or allow tournamentEngine to get all
});

const {
  participatingTeamsCount, // only if no teamPartiicpantId has been specified
  allParticipantStats, // only if no teamParticipantId has been specified
  relevantMatchUps, // matchUps which were relevant to the calculations
  opponentStats, // only if opponentParticipantId has been provided
  teamStats, // only if teamParticipantId has been provided
  success, // when no error
  error, // if error
} = result;
```

---

## getPersonRequests

Returns an object with array of requests for each relevant `personId`. Request objects are returned with a `requestId` which can be used to call [modifyPersonRequests](competition-engine-api#modifypersonrequests).

See [addPersonRequests](competition-engine-api#addpersonrequests) for request object structure.

```js
const { personRequests } = engine.getPersonRequests({
  requestType, // optional filter
});
```

---

## getPolicyDefinitions

Finds policies which have been attached to the tournamentRecord, or to a target event, or target drawDefinition, in reverse order.
Once a matching `policyType` has been found, higher level policies of the same type are ignored, enabling a default policy to be attached to the tournamentRecord and for event-specific or draw-specific policies to override the default(s).

The constructed `policyDefinitions` object contains targeted policies from all levels, scoped to the lowest level specified.

See [Policies](../concepts/policies).

```js
const { policyDefinitions } = engine.getPolicyDefinitions({
  policyTypes: [POLICY_TYPE_SEEDING],
  eventId, // optional
  drawId, // optional
});
```

---

## getPositionAssignments

Returns an array of `positionAssignments` for a structure. Combines `positionAssginments` for child structures in the case of ROUND_ROBIN where `{ structureType: CONTAINER }`.

```js
let { positionAssignments } = engine.getPositionAssignments({
  structureId, // optional if { structure } is provided
  structure, // optional if { drawId, structureId } are provided
  drawId, // optional if { structure } is provided
});

const [{ drawPosition, participantId, qualifier, bye }] = positionAssignments;
```

---

## getPredictiveAccuracy

```js
const { accuracy, zoneDistribution } = engine.getPredictiveAccuracy({
  exclusionRule: { valueAccessor: 'confidence', range: [0, 70] }, // exclude low confidence values

  zoneMargin: 3, // optional - creates +/- range and report competitiveness distribution
  zonePct: 20, // optional - precedence over zoneMargin, defaults to 100% of rating range

  valueAccessor: 'wtnRating', // optional if `scaleName` is defined in factory `ratingsParameters`
  ascending: false, // optional - scale goes from low to high with high being the "best"
  scaleName: WTN,
});
```

---

## getRoundMatchUps

Organizes matchUps by roundNumber. **roundMatchUps** contains matchUp objects; **roundProfile** provides an overview of drawPositions which have advanced to each round, a matchUpsCount, finishingPositionRange for winners and losers, and finishingRound.

```js
const { roundMatchUps, roundProfile } = engine.getRoundMatchUps({
  matchUps,
});
```

---

## getScaledEntries

See [Scale Items](../concepts/scaleItems).

```js
const { scaledEntries } = engine.getScaledEntries({
  eventId, // optional - not required if provided array of entries
  entries, // optional - overrides use of event.entries
  stage, // optional - filter entries by stage

  scaleAttributes,
  scaleSortMethod, // optional - function(a, b) {} sort method, useful when scaleValue is an object or further proessing is required
  sortDescending, // optional - default sorting is ASCENDING; only applies to default sorting method.
});
```

---

## getSchedulingProfile

Returns a `schedulingProfile` (if present). Checks the integrity of the profile to account for any `venues` or `drawDefinitions` which have been deleted.

```js
const { schedulingProfile } = engine.getSchedulingProfile();
```

---

## getSchedulingProfileIssues

Analyzes the `schedulingProfile` (if any) that is attached to the `tournamentRecord(s)` and reports any issues with the ordering of rounds.

The analysis for each `scheduleDate` only includes `matchUps` to be scheduled on that date.
In other words, the method only reports on scheduling issues relative to the group of `matchUpIds` derived from rounds which are being scheduled for each date.

:::note
In some cases it is valid to schedule a second round, for instance, before a first round, because there may be some second round `matchUps` which are ready to be played... possibly due to `participants` advancing via first round BYEs or WALKOVERs.

Regardless of issues reported, `engine.scheduleProfileRounds()` will attempt to follow the desired order, but will not schedule `matchUps` before dependencies.
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
} = engine.getSchedulingProfileIssues({
  dates, // optional array of target dates
});
```

---

## getSeedsCount

Takes a policyDefinition, drawSize and participantsCount and returrns the number of seeds valid for the specified drawSize

:::note
`drawSizeProgression` will be overridden by a `{ drawSizeProgression }` value in a policyDefinition.
:::

```js
const { seedsCount, error } = engine.getSeedsCount({
  drawSizeProgression, // optional - fits the seedsCount to the participantsCount rather than the drawSize
  policyDefinitions: SEEDING_USTA,
  participantsCount: 15,
  drawSize: 128,
});
```

---

## getSeedingThresholds

```js
const { seedingThresholds } = engine.getSeedingThresholds({
  roundRobinGroupsCount,
  participantsCount,
});
```

---

## getStructureSeedAssignments

Returns seedAssignments for a specific structure based on structureId or structure

The structure of an **_assignment object_** is as follows:

```json
{
  "seedNumber": 1,
  "seedValue": "1",
  "participantId": "uuid-of-participant"
}
```

The most basic usage is to retrieve seed assignments for a draw which has a single main stage structure

```js
const { seedAssignments } = engine.getStructureSeedAssignments({
  structureId,
  drawId,
});
```

---

## getStructureReports

Returns details of all structures within a tournamentRecord, as well as aggregated details per event.

`tournamentId, eventId, structureId, drawId, eventType, category: subType, categoryName, ageCategoryCode, flightNumber, drawType, stage, winningPersonId, winningPersonWTNrating, winningPersonWTNconfidence, winningPerson2Id, winningPerson2WTNrating, winningPerson2WTNconfidence, positionManipulations, pctNoRating, matchUpFormat, pctInitialMatchUpFormat, matchUpsCount, tieFormatDesc, tieFormatName, avgConfidence, avgWTN`

```js
const {
  structureReports,
  eventStructureReports: {
    totalPositionManipulations,
    maxPositionManipulations,
    generatedDrawsCount,
    drawDeletionsCount,
  },
} = engine.getStructureReports({
  firstFlightOnly, // boolean - defaults to true - only return first flight when multiple drawDefinitions per event
  extensionProfiles: [
    {
      name, // extension name
      label, // label for generated attribute
      accessor, // dot-notation accessor for extension value, e.g. 'attribute.attribute'
    },
  ],
});
```

To export report as CSV:

```js
const csv = utilities.JSON2CSV(structureReports);
```

---

## getTeamLineUp

```js
const { lineUp } = engine.getTeamLineUp({ drawId, participantId });
```

---

## getTieFormat

Returns `tieFormat` definition objects for specified context(s).

`tieFormat` for each matchUp is determined by traversing the hierarchy: `matchUp => stucture => drawDefinition => event`

```js
const { tieFormat, structureDefaultTieFormat, drawDefaultTieFormat, eventDefaultTieFormat } = engine.getTieFormat({
  structureId,
  matchUpId,
  eventId,
  drawId,
});
```

---

## getTournamentInfo

Returns tournament attributes. Used to attach details to publishing payload by `getEventData`.

```js
const { tournamentInfo } = getTournamentInfo({ tournamentRecord });
const {
  tournamentId,
  tournamentRank,

  formalName,
  tournamentName,
  promotionalName,
  onlineResources,

  localTimeZone,
  startDate,
  endDate,

  hostCountryCode,
  tournamentContacts,
  tournamentAddresses,
} = tournamentInfo;
```

---

## getTournamentPersons

Returns **deepCopies** of persons extracted from tournament participants. Each person includes an array of `participantIds` from which person data was retrieved.

```js
const { tournamentPersons } = engine.getTournamentPersons({
  participantFilters: { participantRoles: [COMPETITOR] }, // optional - filters
});
```

---

## getTournamentPenalties

Returns an array of all penalties issued during a tournament.

```js
const { penalties } = engine.getTournamentPenalties();
```

---

## getTournamentStructures

```js
const { structures, stageStructures } = engine.getTournamentStructures({
  withStageGrouping: true, // optional return structures grouped by stages
  stageSequences, // optional - specify stageSequences to include
  stageSequence, // optional - filter by stageSequence
  stages, // optional - specify stageSequences to include
  stage, // optional - filter by stage
});
```

---

## getValidGroupSizes

Returns valid Round Robin group sizes for specified `drawSize`.

```js
const { validGroupSizes } = engine.getValidGroupSies({
  groupSizeLimit, // optional - defaults to 10
  drawSize,
});
```

---

## getVenuesAndCourts

Returns an array of all Venues which are part of a tournamentRecord and an aggregation of courts across all venues.

```js
const { venues, courts } = engine.getVenuesAndCourts({
  convertExtensions, // optional boolean
  ignoreDisabled, // optional boolean
  dates, // optional - used with ignoreDisabled - applies to courts
});
```

---

## getVenueData

Returns restricted venue attributes along with information for all associated courts. Used primarily by `getEventData` to return a subset of venue/courts information for publishing purposes.

```js
const {
  venueName,
  venueAbbreviation,
  courtsInfo, // array of courts and associated attributes
} = engine.getVenueData({ venueId });
```

---

## generateBookings

This methods is used internally for creating a "virtual" view of court availability.

```js
const { bookings, relevantMatchUps } = engine.generateBookings({
  defaultRecoveryMinutes, // optional
  averageMatchUpMinutes, // optional
  periodLength, // optional - scheduling period in minutes
  scheduleDate, // optional - only consider matchUps scheduled on scheduleDate
  venueIds, // optional - only consider matchUps at specific venue(s)
  matchUps,
});
```

---

## getVenuesReport

Returns a `venueReports` array which provides details for each targt `venue` for targt date(s).

```js
const { venuesReport } = engine.getVenuesReport({
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

## isCompletedStructure

Returns boolean whether all matchUps in a given structure have been completed

```js
const structureIsComplete = engine.isCompletedStructure({
  structureId,
});
```

---

## isValidForQualifying

Provides determination of whether qualifying structure(s) may be added to the structure specified by `structureId`.

```js
const { valid } = engine.isValidForQualifiying({
  structureId,
  drawId,
});
```

---

## isValidMatchUpFormat

Returns boolean indicating whether matchUpFormat code is valid.

```js
const valid = engine.isValidMatchUpFormat({ matchUpFormat });
```

---

## matchUpActions

Return an array of all validActions for a specific matchUp.

```js
const {
  isByeMatchUp, // boolean; true if matchUp includes a BYE
  structureIsComplete, // boolean; true if structure is ready for positioning
  validActions, // array of possible actions given current matchUpStatus
} = tournamentEngine.matchUpActions({
  restrictAdHocRoundParticipants, // optional - true by default; applies to AD_HOC; disallow the same participant being in the same round multiple times
  sideNumber, // optional - select side to which action should apply; applies to AD_HOC position assignments
  matchUpId, // required - reference to targeted matchUp
  drawId, // optional - not strictly required; method will find matchUp by brute force without it
});

const {
  type, // 'REFEREE', 'SCHEDULE', 'PENALTY', 'STATUS', 'SCORE', 'START', 'END', 'SUBSTITUTION'.
  method, // tournamentEngine method relating to action type
  payload, // attributes to be passed to method
  // additional method-specific options for values to be added to payload when calling method
} = validAction;
```

---

## participantScaleItem

Similar to [getParticipantScaleItem](#getparticipantscaleitem) but takes a `participant` object and doesn't require `tournamentEngine.setState(tournamentRecord)`.

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
} = engine.participantScaleItem({
  scaleAttributes,
  participant,
});
```

---

## positionActions

Returns valid actions for a given `drawPosition`. If params includes `matchUpId` will pass through to [matchUpActions](#matchupactions) when called for **AD_HOC** structures.

```js
const positionActions = engine.positionActions({
  policyDefinitions: positionActionsPolicy, // optional - policy defining what actions are allowed in client context
  returnParticipants, // optional boolean; defaults to true; performance optimization when false requires client to provide participants.
  drawPosition,
  structureId,
  drawId,
});

const {
  isActiveDrawPosition, // boolean
  isByePosition, // boolean
  isDrawPosition, // boolean
  hasPositionAssiged, // boolean
  validActions,
} = positionActions;

const {
  type, // 'ASSIGN', 'LUCKY', 'SWAP', 'BYE', 'REMOVE'
  method, // tournamentEngine method relating to action type
  payload, // attributes to be passed to method
  // additional method-specific options for values to be added to payload when calling method
} = validAction;
```

---

## tournamentMatchUps

Returns tournament matchUps grouped by matchUpStatus. These matchUps are returned with _context_.

```js
const { abandonedMatchUps, completedMatchUps, upcomingMatchUps, pendingMatchUps, byeMatchUps, groupInfo } =
  engine.tournamentMatchUps({
    matchUpFilters, // optional; [ scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
    policyDefinitions, // optional - seeding or avoidance policies to be used when placing participants
    scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  });
```

---

## validateSchedulingProfile

```js
const { valid, error } = engine.validateSchedulingProfile({
  schedulingProfile,
});
```
