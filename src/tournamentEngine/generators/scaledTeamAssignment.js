import { participantScaleItem } from '../accessors/participantScaleItem';
import { getParticipantId } from '../../global/functions/extractors';
import { getFlightProfile } from '../getters/getFlightProfile';

import { TEAM as TEAM_EVENT } from '../../constants/eventConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
  TEAM_NOT_FOUND,
} from '../../constants/errorConditionConstants';
import {
  INDIVIDUAL,
  TEAM as TEAM_PARTICIPANT,
} from '../../constants/participantConstants';

/*
scaledParticipants are equivalent to scaledEntries
...because it should also be possible to assign INDIVIDUAL participants to teams outside of an event scope,
the parameter is generalized... as long as there is a `participantId` and a `scaleValue` is will succeed

{
  participantId: '60f3e684-b6d2-47fc-a579-d0ab8f020810',
  scaleValue: 1
}
*/

export function scaledTeamAssignment({
  teamParticipantIds,
  ascending = true, // sort direction; by default sort least to greatest, followed by undefined
  tournamentRecord,

  scaledParticipants, // optional - either scaledParticipants or (individualParticipantIds and scaleName) must be provided

  individualParticipantIds, // if scaledParticipants are provided, individualParticipants is ignored
  scaleAttributes, // if scaledParticipants are provided, scaleName is ignored
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(teamParticipantIds)) return { error: INVALID_VALUES };
  if (scaledParticipants && !Array.isArray(scaledParticipants))
    return { error: INVALID_VALUES };
  if (scaleAttributes && typeof scaleAttributes !== 'object')
    return { error: INVALID_VALUES };
  if (
    (!scaleAttributes ||
      !individualParticipantIds ||
      !Object.keys(scaleAttributes).length) &&
    !scaledParticipants
  ) {
    return { error: MISSING_VALUE, info: 'Missing scaling details' };
  }

  const relevantTeams = [];
  for (const participant of tournamentRecord.participants || []) {
    const { participantId, participantType } = participant;
    if (!teamParticipantIds.includes(participantId)) continue;
    if (participantType !== TEAM_PARTICIPANT)
      return { error: INVALID_PARTICIPANT_TYPE, participant };
    relevantTeams.push(participant);
  }

  if (!relevantTeams.length) return { error: TEAM_NOT_FOUND };

  if (!scaledParticipants) {
    const relevantIndividualParticipants = [];
    for (const participant of tournamentRecord.participants || []) {
      const { participantId, participantType } = participant;
      if (!individualParticipantIds.includes(participantId)) continue;
      if (participantType !== INDIVIDUAL)
        return { error: INVALID_PARTICIPANT_TYPE, participant };

      const scaleValue = participantScaleItem({ participant, scaleAttributes })
        ?.scaleItem?.scaleValue;

      const scaledParticipant = { participantId, scaleValue };
      relevantIndividualParticipants.push(scaledParticipant);
    }

    if (!relevantIndividualParticipants.length)
      return { error: PARTICIPANT_NOT_FOUND };

    const participantsWithScaleValues = [];
    const participantsNoScaleValues = [];
    for (const relevantPartiipant of relevantIndividualParticipants) {
      if (relevantPartiipant.scaleValue) {
        participantsWithScaleValues.push(relevantPartiipant);
      } else {
        participantsNoScaleValues.push(relevantPartiipant);
      }
    }

    scaledParticipants = participantsWithScaleValues
      .sort((a, b) =>
        ascending ? a.scaleValue - b.scaleValue : b.scaleValue - a.scaleValue
      )
      .concat(...participantsNoScaleValues);
  }

  // clear pre-existing individualParticipantids
  for (const relevantTeam of relevantTeams) {
    relevantTeam.individualParticipants = [];
  }

  for (const scaledParticipant of scaledParticipants.sort(
    (a, b) => a.scaleValue - b.scaleValue
  )) {
    if (!scaledParticipant.participantId)
      return { error: INVALID_VALUES, scaledParticipant };
  }

  let index = 0;
  while (index < scaledParticipants.length) {
    for (const relevantTeam of relevantTeams) {
      if (index + 1 > scaledParticipants.length) break;
      const scaledParticipant = scaledParticipants[index];
      relevantTeam.individualParticipantIds.push(
        scaledParticipant.participantId
      );
      index++;
    }
    relevantTeams.reverse();
  }

  const relevantTeamParticipantIds = relevantTeams.map(getParticipantId);
  // for all events, check if any relevant teams are present
  // if a relevant team is present, remove any UNGROUPED participants that are part of that team
  for (const event of tournamentRecord.events || []) {
    if (event.eventType !== TEAM_EVENT) continue;
    const relevantTeamEntries = (event.entries || []).filter((entry) =>
      relevantTeamParticipantIds.includes(entry.participantId)
    );
    for (const relevantEntry of relevantTeamEntries) {
      const individualParticipantIds = relevantEntry.individualParticipantIds;
      // remove any relevant individualParticipant entries from event.entries
      event.entries = (event.entries || []).filter(
        (entry) => !individualParticipantIds.includes(entry.participantId)
      );
      // also remove any relevant individualParticipant entries from drawDefinition.entries
      (event.drawDefinitions || []).forEach((drawDefinition) => {
        drawDefinition.entries = (drawDefinition.entries || []).filter(
          (entry) => !individualParticipantIds.includes(entry.participantId)
        );
      });
      // also remove any relevant individualParticipant any flight.drawEntries
      const { flightProfile } = getFlightProfile({ event });
      (flightProfile?.flights || []).forEach((flight) => {
        flight.drawEntries = (flight.drawEntries || []).filter(
          (entry) => !individualParticipantIds.includes(entry.participantId)
        );
      });
    }
  }

  return { ...SUCCESS };
}
