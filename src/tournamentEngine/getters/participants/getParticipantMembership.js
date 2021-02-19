import { getTournamentParticipants } from './getTournamentParticipants';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { GROUP, PAIR, TEAM } from '../../../constants/participantTypes';

/**
 *
 * Returns all grouping participants which include individual participantId
 *
 * @param {object} tournamentRecord - passed automatically by tournamentEngine
 * @param {string} participantId - id of individual participant
 *
 */
export function getParticipantMembership({ tournamentRecord, participantId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: { participantTypes: [TEAM, PAIR, GROUP] },
  });

  const memberOf = (tournamentParticipants || []).filter((participant) => {
    return participant.individualParticipantIds?.includes(participantId);
  });

  const groupingTypeMap = memberOf.reduce((groupingTypesMap, participant) => {
    const { participantType } = participant;
    if (!groupingTypesMap[participantType])
      groupingTypesMap[participantType] = [];
    groupingTypesMap[participantType].push(participant);
    return groupingTypesMap;
  }, {});

  return groupingTypeMap;
}
