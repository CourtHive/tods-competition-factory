import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getParticipantEntries } from './getParticipantEntries';
import { filterParticipants } from './filterParticipants';
import { getParticipantMap } from './getParticipantMap';
import { definedAttributes } from '../../../utilities';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getParticipants({
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
  withStatistics,
  withOpponents,
  withMatchUps,
  internalUse,
  withSeeding,
  withEvents,
  withDraws,
  withISO2,
  withIOC,
  // inContext, - may be deprecated in favor of `withIndividualParticipants`
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (withMatchUps) getMatchUpDependencies({ tournamentRecord }); // ensure goesTos are present

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
  let participantIdsWithConflicts,
    eventsPublishStatuses,
    derivedEventInfo,
    derivedDrawInfo,
    mappedMatchUps,
    matchUps;
  ({
    participantIdsWithConflicts,
    eventsPublishStatuses,
    derivedEventInfo,
    derivedDrawInfo,
    participantMap,
    mappedMatchUps,
    matchUps,
  } = getParticipantEntries({
    withEvents: withEvents || withRankingProfile,
    withDraws: withDraws || withRankingProfile,
    withPotentialMatchUps,
    participantFilters,
    withRankingProfile,
    policyDefinitions,
    convertExtensions,
    withScheduleItems,
    tournamentRecord,
    scheduleAnalysis,
    withTeamMatchUps,
    usePublishState,
    withStatistics,
    participantMap,
    withOpponents,
    withMatchUps,
    withSeeding,
  }));

  const nextMatchUps = scheduleAnalysis || withPotentialMatchUps;
  const processedParticipants = Object.values(participantMap).map(
    ({
      potentialMatchUps,
      statistics,
      opponents,
      matchUps,
      events,
      draws,
      ...p
    }) => {
      const participantDraws = Object.values(draws);
      const participantOpponents = Object.values(opponents);
      if (withOpponents) {
        participantDraws?.forEach((draw) => {
          draw.opponents = participantOpponents.filter(
            (opponent) => opponent.drawId === draw.drawId
          );
        });
      }

      return definedAttributes(
        {
          ...p.participant,
          draws: withDraws || withRankingProfile ? participantDraws : undefined,
          events:
            withEvents || withRankingProfile
              ? Object.values(events)
              : undefined,
          matchUps: withMatchUps ? Object.values(matchUps) : undefined,
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
  let participants = filterParticipants({
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
