import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getParticipantEntries } from './getParticipantEntries';
import { filterParticipants } from './filterParticipants';
import { getParticipantMap } from './getParticipantMap';
import { definedAttributes } from '../../../utilities';

import { HydratedParticipant } from '../../../types/hydrated';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  ErrorType,
} from '../../../constants/errorConditionConstants';

export function getParticipants(params): {
  eventsPublishStatuses?: { [key: string]: any };
  participantMap?: { [key: string]: any };
  participantIdsWithConflicts?: string[];
  participants?: HydratedParticipant[];
  derivedEventInfo?: any;
  derivedDrawInfo?: any;
  mappedMatchUps?: any;
  error?: ErrorType;
  success?: boolean;
  matchUps?: any[];
} {
  const {
    withIndividualParticipants,
    participantFilters = {},
    withPotentialMatchUps,
    withRankingProfile,
    convertExtensions,
    policyDefinitions,
    withScheduleItems,
    tournamentRecord,
    scheduleAnalysis,
    withSignInStatus,
    withTeamMatchUps,
    withScaleValues,
    usePublishState,
    contextProfile,
    withStatistics,
    withOpponents,
    withMatchUps,
    internalUse,
    withSeeding,
    withEvents,
    withDraws,
    withISO2,
    withIOC,
  } = params;

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  if (withMatchUps || withRankingProfile) {
    getMatchUpDependencies({ tournamentRecord }); // ensure goesTos are present
  }

  let { participantMap } = getParticipantMap({
    withIndividualParticipants,
    convertExtensions,
    policyDefinitions,
    tournamentRecord,
    withSignInStatus,
    withScaleValues,
    internalUse,
    withISO2,
    withIOC,
  });

  const entriesResult = getParticipantEntries({
    withMatchUps: withMatchUps || withRankingProfile,
    withEvents: withEvents || withRankingProfile,
    withDraws: withDraws || withRankingProfile,
    withPotentialMatchUps,
    participantFilters,
    withRankingProfile,
    convertExtensions,
    withScheduleItems,
    policyDefinitions,
    tournamentRecord,
    scheduleAnalysis,
    withTeamMatchUps,
    usePublishState,
    withStatistics,
    participantMap,
    withOpponents,
    contextProfile,
    withSeeding,
  });

  const {
    participantIdsWithConflicts,
    eventsPublishStatuses,
    derivedEventInfo,
    derivedDrawInfo,
    mappedMatchUps,
  } = entriesResult;

  const matchUps: any[] = entriesResult.matchUps;

  participantMap = entriesResult.participantMap;

  const nextMatchUps = scheduleAnalysis || withPotentialMatchUps;
  const processedParticipants = Object.values(participantMap).map(
    ({
      potentialMatchUps,
      scheduleConflicts,
      statistics,
      opponents,
      matchUps,
      events,
      draws,
      ...p
    }) => {
      const participantDraws: any[] = Object.values(draws);
      const participantOpponents = Object.values(opponents);
      if (withOpponents) {
        participantDraws?.forEach((draw) => {
          draw.opponents = participantOpponents.filter(
            (opponent: any) => opponent.drawId === draw.drawId
          );
        });
      }

      return definedAttributes(
        {
          ...p.participant,
          scheduleConflicts: scheduleAnalysis ? scheduleConflicts : undefined,
          draws: withDraws || withRankingProfile ? participantDraws : undefined,
          events:
            withEvents || withRankingProfile
              ? Object.values(events)
              : undefined,
          matchUps:
            withMatchUps || withRankingProfile
              ? Object.values(matchUps)
              : undefined,
          opponents: withOpponents ? participantOpponents : undefined,
          potentialMatchUps: nextMatchUps
            ? Object.values(potentialMatchUps)
            : undefined,
          statistics: withStatistics ? Object.values(statistics) : undefined,
        },
        false,
        false,
        true
      );
    }
  );

  // filter must be last so attributes can be used for reporting & etc.
  const participants = filterParticipants({
    participants: processedParticipants,
    participantFilters,
    tournamentRecord,
  });

  // IDEA: optimizePayload derive array of matchUpIds required for filteredParticipants
  // filter mappedMatchUps and matchUps to reduce over-the-wire payloads

  return {
    participantIdsWithConflicts,
    eventsPublishStatuses,
    derivedEventInfo,
    derivedDrawInfo,
    mappedMatchUps,
    participantMap,
    participants,
    ...SUCCESS,
    matchUps,
  };
}
