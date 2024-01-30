import { scheduleProfileRounds } from '@Mutate/matchUps/schedule/scheduleProfileRounds';
import { attachPolicies } from '@Mutate/extensions/policies/attachPolicies';
import { newTournamentRecord } from '../tournamentRecords/newTournamentRecord';
import { formatDate, isValidDateString } from '@Tools/dateTime';
import { addTournamentParticipants } from './addTournamentParticipants';
import { isValidExtension } from '../../../validators/isValidExtension';
import { cycleMutationStatus } from '@Global/state/globalState';
import { generateVenues } from '@Mutate/venues/generateVenues';
import { generateEventWithFlights } from './generateEventWithFlights';
import { generateScheduledRounds } from './generateScheduledRounds';
import { definedAttributes } from '@Tools/definedAttributes';
import { generateEventWithDraw } from './generateEventWithDraw';
import { Extension } from '@Types/tournamentTypes';
import { addEvent } from '@Mutate/events/addEvent';
import { randomPop } from '@Tools/arrays';

import { INVALID_DATE, INVALID_VALUES } from '../../../constants/errorConditionConstants';
import defaultRatingsParameters from '@Fixtures/ratings/ratingsParameters';
import { SUCCESS } from '../../../constants/resultConstants';

const mockTournamentNames = [
  'Mock Tournament',
  'CourtHive Challenge',
  'Racket Rally',
  'Generated Tournament',
  'Factory Follies',
  'Open Competition',
];

type GenerateTournamentRecordArgs = {
  scheduleCompletedMatchUps?: boolean;
  tournamentExtensions?: Extension[];
  completeAllMatchUps?: boolean;
  tournamentName?: string;
  autoSchedule?: boolean;
  startDate?: string;
  endDate?: string;
  uuids?: string[];

  [key: string]: any;
};

export function generateTournamentRecord(params: GenerateTournamentRecordArgs) {
  let { tournamentAttributes, startDate, endDate } = params ?? {};
  const {
    tournamentName = randomPop(mockTournamentNames),
    ratingsParameters = defaultRatingsParameters,
    scheduleCompletedMatchUps,
    tournamentExtensions,
    matchUpStatusProfile,
    completeAllMatchUps,
    participantsProfile,
    autoEntryPositions,
    hydrateCollections,
    randomWinningSide,
    policyDefinitions,
    schedulingProfile,
    periodLength,
    autoSchedule,
    eventProfiles,
    venueProfiles,
    drawProfiles,
    uuids,
  } = params ?? {};
  if ((startDate && !isValidDateString(startDate)) || (endDate && !isValidDateString(endDate)))
    return { error: INVALID_DATE };

  if (eventProfiles && !Array.isArray(eventProfiles)) return { error: INVALID_VALUES };

  if (!startDate) {
    const tournamentDate = new Date();
    startDate = formatDate(endDate ?? tournamentDate);
    endDate = formatDate(tournamentDate.setDate(tournamentDate.getDate() + 7));
  }
  if (!endDate) {
    const tournamentDate = new Date(startDate);
    endDate = formatDate(tournamentDate.setDate(tournamentDate.getDate() + 7));
  }

  if (typeof tournamentAttributes !== 'object') tournamentAttributes = {};
  const tournamentRecord = newTournamentRecord({
    ...tournamentAttributes,
    tournamentName,
    isMock: true,
    startDate,
    endDate,
  });

  // attach any valid tournamentExtensions
  if (tournamentExtensions?.length && Array.isArray(tournamentExtensions)) {
    const extensions = tournamentExtensions.filter((extension) => isValidExtension({ extension }));

    if (extensions?.length) Object.assign(tournamentRecord, { extensions, isMock: true });
  }

  if (typeof policyDefinitions === 'object') {
    for (const policyType of Object.keys(policyDefinitions)) {
      attachPolicies({
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
        tournamentRecord,
      });
    }
  }

  const result = addTournamentParticipants({
    participantsProfile,
    tournamentRecord,
    eventProfiles,
    drawProfiles,
    startDate,
    uuids,
  });
  if (!result.success) return result;

  const allUniqueParticipantIds: string[] = [],
    eventIds: string[] = [],
    drawIds: string[] = [];

  if (Array.isArray(drawProfiles)) {
    let drawIndex = 0;
    for (const drawProfile of drawProfiles) {
      let result = generateEventWithDraw({
        allUniqueParticipantIds,
        matchUpStatusProfile,
        completeAllMatchUps,
        autoEntryPositions,
        hydrateCollections,
        participantsProfile,
        randomWinningSide,
        ratingsParameters,
        tournamentRecord,
        isMock: true,
        drawProfile,
        startDate,
        drawIndex,
        uuids,
      });
      if (result.error) return result;

      const { drawId, eventId, event, uniqueParticipantIds } = result;

      result = addEvent({
        suppressNotifications: false,
        internalUse: true,
        tournamentRecord,
        event,
      });
      if (result.error) return result;

      if (drawId) drawIds.push(drawId);
      eventIds.push(eventId);

      if (uniqueParticipantIds?.length) allUniqueParticipantIds.push(...uniqueParticipantIds);

      drawIndex += 1;
    }
  }

  if (eventProfiles) {
    let eventIndex = 0;
    for (const eventProfile of eventProfiles) {
      const result = generateEventWithFlights({
        allUniqueParticipantIds,
        matchUpStatusProfile,
        participantsProfile,
        completeAllMatchUps,
        autoEntryPositions,
        hydrateCollections,
        randomWinningSide,
        ratingsParameters,
        tournamentRecord,
        eventProfile,
        eventIndex,
        startDate,
        uuids,
      });
      if (result.error) return result;

      const { eventId, drawIds: generatedDrawIds, uniqueParticipantIds } = result;

      if (generatedDrawIds) drawIds.push(...generatedDrawIds);
      eventIds.push(eventId);

      if (uniqueParticipantIds?.length) allUniqueParticipantIds.push(...uniqueParticipantIds);

      eventIndex += 1;
    }
  }

  const venueIds = venueProfiles?.length ? generateVenues({ tournamentRecord, venueProfiles, uuids }) : [];

  let scheduledRounds;
  let schedulerResult = {};
  if (schedulingProfile) {
    const result = generateScheduledRounds({
      schedulingProfile,
      tournamentRecord,
    });
    if (result.error) return result;
    scheduledRounds = result.scheduledRounds;

    if (autoSchedule) {
      const { tournamentId } = tournamentRecord;
      const tournamentRecords = { [tournamentId]: tournamentRecord };

      schedulerResult = scheduleProfileRounds({
        scheduleCompletedMatchUps,
        tournamentRecords,
        periodLength,
      });
    }
  }

  // clear globalState modified flag;
  cycleMutationStatus();

  return definedAttributes({
    ...SUCCESS,
    tournamentRecord,
    scheduledRounds,
    schedulerResult,
    eventIds,
    venueIds,
    drawIds,
  });
}
