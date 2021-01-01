import { addParticipantContext } from './addParticipantContext';
import { makeDeepCopy } from '../../../utilities';

import {
  INVALID_OBJECT,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { PAIR, TEAM } from '../../../constants/participantTypes';
import { getTimeItem } from '../../governors/queryGovernor/timeItems';
import { SIGN_IN_STATUS } from '../../../constants/participantConstants';
import { getAccessorValue } from '../../../utilities/getAccessorValue';

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

  inContext,
  convertExtensions,
  withStatistics,
  withOpponents,
  withMatchUps,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  let tournamentParticipants = tournamentRecord.participants.map(
    (participant) => makeDeepCopy(participant, convertExtensions)
  );

  if (typeof participantFilters !== 'object')
    return { error: INVALID_OBJECT, participantFilters };

  const {
    eventIds,
    signInStatus,
    participantTypes,
    participantRoles,
    accessorValues,
  } = participantFilters;

  const participantHasAccessorValues = (participant) => {
    return accessorValues.reduce((hasValues, keyValue) => {
      const { accessor, value } = keyValue;
      const { values } = getAccessorValue({
        element: participant,
        accessor,
      });
      return hasValues && values.includes(value);
    }, true);
  };

  tournamentParticipants = tournamentParticipants.filter((participant) => {
    const participantSignInStatus = getTimeItem({
      element: participant,
      itemType: SIGN_IN_STATUS,
    });
    return (
      (!signInStatus || participantSignInStatus === signInStatus) &&
      (!participantTypes ||
        (isValidFilterArray(participantTypes) &&
          participantTypes.includes(participant.participantType))) &&
      (!participantRoles ||
        (isValidFilterArray(participantRoles) &&
          participantRoles.includes(participant.participantRole))) &&
      (!accessorValues ||
        (isValidFilterArray(accessorValues) &&
          participantHasAccessorValues(participant)))
    );
  });

  const tournamentEvents =
    (isValidFilterArray(eventIds) &&
      tournamentRecord.events.filter((event) =>
        eventIds.includes(event.eventId)
      )) ||
    tournamentRecord.events ||
    [];

  if (tournamentEvents.length && eventIds) {
    const participantIds = tournamentEvents
      .filter((event) => eventIds.includes(event.eventId))
      .map((event) => {
        const enteredParticipantIds = event.entries.map(
          (entry) => entry.participantId
        );
        if (event.eventType === SINGLES) return enteredParticipantIds;
        const individualParticipantIds = tournamentRecord.participants
          .filter((participant) =>
            enteredParticipantIds.includes(participant.participantId)
          )
          .map((participant) => participant.individualParticipantIds)
          .flat(1);
        return enteredParticipantIds.concat(...individualParticipantIds);
      })
      .flat(1);
    tournamentParticipants = tournamentParticipants.filter((participant) =>
      participantIds.includes(participant.participantId)
    );
  }

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
      tournamentEvents,
      tournamentParticipants,
      withStatistics,
      withOpponents,
      withMatchUps,
    });
  }

  return { tournamentParticipants };
}

function isValidFilterArray(filter) {
  return filter && Array.isArray(filter) && filter.length;
}
