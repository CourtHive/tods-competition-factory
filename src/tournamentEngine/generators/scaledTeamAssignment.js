import { participantScaleItem } from '../accessors/participantScaleItem';
import { getParticipantId } from '../../global/functions/extractors';
import { getFlightProfile } from '../getters/getFlightProfile';
import { isConvertableInteger } from '../../utilities/math';

import { TEAM_EVENT } from '../../constants/eventConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NO_CANDIDATES,
  PARTICIPANT_NOT_FOUND,
  TEAM_NOT_FOUND,
} from '../../constants/errorConditionConstants';
import {
  INDIVIDUAL,
  TEAM_PARTICIPANT,
} from '../../constants/participantConstants';

/*
scaledParticipants are equivalent to scaledEntries
...because it should also be possible to assign INDIVIDUAL participants to teams outside of an event scope,
the parameter is generalized... as long as there is a `participantId` and a `scaleValue` is will succeed

{
  participantId: '60f3e684-b6d2-47fc-a579-d0ab8f020810',
  scaleValue: 1
}

scaleAttributes can include { accessor: 'attribute' } which will return scaleItem.scaleValue[accessor] for scaleValue
*/

export function scaledTeamAssignment({
  clearExistingAssignments = true, // by default remove all existing individualParticipantIds from targeted teams
  individualParticipantIds, // if scaledParticipants are provided, individualParticipants is ignored
  reverseAssignmentOrder, // optional - reverses team order; useful for sequential assignment of participant groupings to ensure balanced distribution
  initialTeamIndex = 0, // optional - allows assignment to begin at a specified array index; useful for sequential assignment of groups of scaledParticipants
  scaledParticipants, // optional - either scaledParticipants or (individualParticipantIds and scaleName) must be provided
  teamParticipantIds, // optional, IF teamsCount is provided then teams will be created
  tournamentRecord,
  scaleAttributes, // ignored if scaledParticipants are provided; { scaleName, scaleType, sortOrder, eventType }
  teamNameBase, // optional - defaults to '[categoryName] TEAM #', where categoryName is derived from eventId (if supplied)
  teamsCount, // optional - derived from teamParticipantIds (if provided) - create # of teams if teamParticipantIds provided are insufficient
  eventId, // optional - source teamParticipantIds from DIRECT_ACCEPTANCE participants in a TEAM event
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (
    (!Array.isArray(teamParticipantIds) &&
      !isConvertableInteger(teamsCount) &&
      !eventId) ||
    !isConvertableInteger(initialTeamIndex) ||
    (scaledParticipants && !Array.isArray(scaledParticipants)) ||
    (scaleAttributes && typeof scaleAttributes !== 'object')
  ) {
    return { error: INVALID_VALUES };
  }
  if (
    (!scaleAttributes ||
      !individualParticipantIds ||
      !Object.keys(scaleAttributes).length) &&
    !scaledParticipants
  ) {
    return { error: MISSING_VALUE, info: 'Missing scaling details' };
  }

  let participantIdsToAssign =
    individualParticipantIds ||
    scaledParticipants.map(({ participantId }) => participantId);

  if (reverseAssignmentOrder) {
    teamParticipantIds.reverse();
    initialTeamIndex += 1; // ensures that the targeted team remains the first team to receive an assignment
  }
  if (initialTeamIndex > teamParticipantIds.length - 1) initialTeamIndex = 0;

  const orderedTeamParticipantIds = teamParticipantIds
    .slice(initialTeamIndex)
    .concat(...teamParticipantIds.slice(0, initialTeamIndex));

  const relevantTeams = [];
  // build up an array of targeted TEAM participants
  for (const participant of tournamentRecord.participants || []) {
    const { participantId, participantType } = participant;
    if (!orderedTeamParticipantIds.includes(participantId)) continue;
    if (participantType !== TEAM_PARTICIPANT)
      return { error: INVALID_PARTICIPANT_TYPE, participant };
    relevantTeams.push(participant);
  }

  if (teamsCount && relevantTeams.length < teamsCount) {
    // add teamParticipants
    console.log({ teamNameBase });
  }

  if (!relevantTeams.length) return { error: TEAM_NOT_FOUND };

  if (clearExistingAssignments) {
    // clear pre-existing individualParticipantIds
    for (const relevantTeam of relevantTeams) {
      relevantTeam.individualParticipantIds = [];
    }
  } else {
    const preAssignedParticipantIds = relevantTeams
      .map((individualParticipantIds) => individualParticipantIds)
      .flat();

    if (individualParticipantIds?.length) {
      participantIdsToAssign = participantIdsToAssign.filter(
        (participantId) => !preAssignedParticipantIds.includes(participantId)
      );
    } else {
      scaledParticipants = scaledParticipants?.filter(
        ({ participantId }) =>
          !preAssignedParticipantIds.includes(participantId)
      );
    }
  }

  if (!individualParticipantIds?.length && !scaledParticipants?.length) {
    return { error: NO_CANDIDATES, info: 'Nothing to be done' };
  }

  if (!scaledParticipants) {
    const relevantIndividualParticipants = [];
    for (const participant of tournamentRecord.participants || []) {
      const { participantId, participantType } = participant;
      if (!participantIdsToAssign.includes(participantId)) continue;
      if (participantType !== INDIVIDUAL)
        return { error: INVALID_PARTICIPANT_TYPE, participant };

      const scaleItem = participantScaleItem({
        scaleAttributes,
        participant,
      })?.scaleItem;

      const scaleValue = scaleAttributes.accessor
        ? scaleItem?.scaleValue?.[scaleAttributes.accessor]
        : scaleItem?.scaleValue;

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
        scaleAttributes.sortOrder
          ? b.scaleValue - a.scaleValue
          : a.scaleValue - b.scaleValue
      )
      .concat(...participantsNoScaleValues);
  }

  for (const scaledParticipant of scaledParticipants) {
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
      const relevantTeamParticipantId = relevantEntry.participantId;
      const relevantTeam = relevantTeams.find(
        (teamParticipant) =>
          teamParticipant.participantId === relevantTeamParticipantId
      );
      const individualParticipantIds = relevantTeam?.individualParticipantIds;
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

  return { ...SUCCESS, scaledParticipants };
}
