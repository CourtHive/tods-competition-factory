import { getParticipantEntries } from './getParticipantEntries';
import { filterParticipants } from './filterParticipants';
import { getParticipantMap } from './getParticipantMap';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getParticipants({
  participantFilters = {},
  withPotentialMatchUps,
  convertExtensions,
  policyDefinitions,
  tournamentRecord,
  scheduleAnalysis,
  withSignInStatus,
  withTeamMatchUps,
  withScaleValues,
  withMatchUps,
  internalUse,
  withEvents,
  withDraws,
  withISO2,
  withIOC,
  // inContext,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  let { participantMap } = getParticipantMap({
    convertExtensions,
    policyDefinitions,
    tournamentRecord,
    withSignInStatus,
    withScaleValues,
    internalUse,
    withISO2,
    withIOC,
  });

  let matchUps;
  if (withMatchUps) {
    ({ participantMap, matchUps } = getParticipantEntries({
      withPotentialMatchUps,
      tournamentRecord,
      scheduleAnalysis,
      withTeamMatchUps,
      participantMap,
      withMatchUps,
      withEvents,
      withDraws,
    }));
  }

  let processedParticipants = Object.values(participantMap).map(
    ({ draws, events, matchUps, ...p }) => ({
      ...p.participant,
      matchUps: Object.values(matchUps),
      events: Object.values(events),
      draws: Object.values(draws),
    })
  );

  let participants = filterParticipants({
    participants: processedParticipants,
    participantFilters,
    tournamentRecord,
  });

  return { ...SUCCESS, matchUps, participants };
}
