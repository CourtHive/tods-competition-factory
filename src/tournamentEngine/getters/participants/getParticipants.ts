import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getParticipantEntries } from './getParticipantEntries';
import { filterParticipants } from './filterParticipants';
import { getParticipantMap } from './getParticipantMap';
import { attributeFilter, definedAttributes } from '../../../utilities';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
import { MatchUp, Tournament } from '../../../types/tournamentFromSchema';
import { HydratedParticipant } from '../../../types/hydrated';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ContextProfile,
  ParticipantFilters,
  PolicyDefinitions,
  ScheduleAnalysis,
  ParticipantMap,
} from '../../../types/factoryTypes';
import {
  MISSING_TOURNAMENT_RECORD,
  ErrorType,
} from '../../../constants/errorConditionConstants';

type GetParticipantsArgs = {
  participantFilters?: ParticipantFilters;
  withIndividualParticipants?: boolean;
  scheduleAnalysis?: ScheduleAnalysis;
  policyDefinitions?: PolicyDefinitions;
  withPotentialMatchUps?: boolean;
  contextProfile?: ContextProfile;
  tournamentRecord: Tournament;
  withRankingProfile?: boolean;
  convertExtensions?: boolean;
  withScheduleItems?: boolean;
  withSignInStatus?: boolean;
  withTeamMatchUps?: boolean;
  withScaleValues?: boolean;
  usePublishState?: boolean;
  withStatistics?: boolean;
  withOpponents?: boolean;
  withMatchUps?: boolean;
  internalUse?: boolean;
  withSeeding?: boolean;
  withEvents?: boolean;
  withDraws?: boolean;
  withISO2?: boolean;
  withIOC?: boolean;
};
export function getParticipants(params: GetParticipantsArgs): {
  eventsPublishStatuses?: { [key: string]: any };
  participantIdsWithConflicts?: string[];
  participants?: HydratedParticipant[];
  participantMap?: ParticipantMap;
  derivedEventInfo?: any;
  derivedDrawInfo?: any;
  matchUps?: MatchUp[];
  mappedMatchUps?: any;
  error?: ErrorType;
  success?: boolean;
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
    tournamentRecord,
    withSignInStatus,
    withScaleValues,
    internalUse,
    withISO2,
    withIOC,
  });

  const entriesResult = getParticipantEntries({
    withMatchUps: withMatchUps ?? withRankingProfile,
    withEvents: withEvents ?? withRankingProfile,
    withDraws: withDraws ?? withRankingProfile,
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

  const nextMatchUps = scheduleAnalysis ?? withPotentialMatchUps;
  const processedParticipants = Object.values(participantMap).map(
    ({
      potentialMatchUps,
      scheduleConflicts,
      participant,
      statistics,
      opponents,
      matchUps,
      events,
      draws,
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
          ...participant,
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

  const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];
  const template = participantAttributes?.participant;

  // filter must be last so attributes can be used for reporting & etc.
  const filteredParticipants = filterParticipants({
    participants: processedParticipants,
    participantFilters,
    tournamentRecord,
  });

  const participants: HydratedParticipant[] = template
    ? filteredParticipants.map((source) =>
        attributeFilter({ source, template })
      )
    : filteredParticipants;

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
