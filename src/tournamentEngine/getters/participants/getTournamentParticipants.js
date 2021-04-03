import { participantPolicyDefinitionFilter } from './participantPolicyDefinitionFilter';
import { addParticipantContext } from './addParticipantContext';
import { filterParticipants } from './filterParticipants';
import { makeDeepCopy } from '../../../utilities';

import {
  INVALID_OBJECT,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { PAIR, TEAM } from '../../../constants/participantTypes';

/**
 * Returns deepCopies of tournament participants filtered by participantFilters which are arrays of desired participant attribute values
 *
 * @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
 * @param {object} participantFilters - attribute arrays with filter value strings
 * @param {boolean} inContext - adds individualParticipants for all individualParticipantIds
 * @param {boolean} withStatistics - adds events: { [eventId]: eventName }, matchUps: { [matchUpId]: score }, statistics: [{ statCode: 'winRatio'}]
 * @param {boolean} withOpponents - include opponent participantIds
 * @param {boolean} withMatchUps - include all matchUps in which participant appears
 *
 */
export function getTournamentParticipants({
  tournamentRecord,

  participantFilters = {},
  policyDefinition,

  inContext,
  convertExtensions,
  withStatistics,
  withOpponents,
  withMatchUps,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  let tournamentParticipants = participantPolicyDefinitionFilter({
    participants: tournamentRecord.participants,
    policyDefinition,
    convertExtensions,
  });

  if (typeof participantFilters !== 'object')
    return { error: INVALID_OBJECT, participantFilters };

  if (participantFilters)
    tournamentParticipants = filterParticipants({
      tournamentRecord,
      participantFilters,
      participants: tournamentParticipants,
    });

  if (inContext) {
    tournamentParticipants.forEach((participant) => {
      if ([PAIR, TEAM].includes(participant.participantType)) {
        participant.individualParticipants = participant.individualParticipantIds.map(
          (participantId) => {
            const individualParticipant = tournamentRecord.participants.find(
              (p) => p.participantId === participantId
            );
            return makeDeepCopy(individualParticipant, convertExtensions);
          }
        );
      }
    });
  }

  if (withMatchUps || withStatistics || withOpponents) {
    addParticipantContext({
      tournamentRecord,
      tournamentEvents: tournamentRecord.events,
      tournamentParticipants,
      withStatistics,
      withOpponents,
      withMatchUps,
    });
  }

  return { tournamentParticipants };
}
