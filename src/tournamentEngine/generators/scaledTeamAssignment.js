import { SUCCESS } from '../../constants/resultConstants';
import { INDIVIDUAL, TEAM } from '../../constants/participantTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
  TEAM_NOT_FOUND,
} from '../../constants/errorConditionConstants';

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
  tournamentRecord,

  scaledParticipants, // optional - either scaledParticipants or (individualParticipantIds and scaleName) must be provided

  individualParticipantIds, // if scaledParticipants are provided, individualParticipants is ignored
  scaleName, // if scaledParticipants are provided, scaleName is ignored
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(teamParticipantIds)) return { error: INVALID_VALUES };
  if (scaledParticipants && !Array.isArray(scaledParticipants))
    return { error: INVALID_VALUES };
  if (scaleName && typeof scaleName !== 'string')
    return { error: INVALID_VALUES };
  if (!scaleName && !individualParticipantIds && !scaledParticipants)
    return { error: MISSING_VALUE };

  const relevantTeams = [];
  for (const participant of tournamentRecord.participants || []) {
    const { participantId, participantType } = participant;
    if (!teamParticipantIds.includes(participantId)) continue;
    if (participantType !== TEAM)
      return { error: INVALID_PARTICIPANT_TYPE, participant };
    relevantTeams.push(participant);
  }

  if (!relevantTeams.length) return { error: TEAM_NOT_FOUND };

  const relevantIndividualParticipants = [];
  for (const participant of tournamentRecord.participants || []) {
    const { participantId, participantType } = participant;
    if (!individualParticipantIds.includes(participantId)) continue;
    if (participantType !== INDIVIDUAL)
      return { error: INVALID_PARTICIPANT_TYPE, participant };
    relevantIndividualParticipants.push(participant);
  }

  if (!relevantIndividualParticipants.length)
    return { error: PARTICIPANT_NOT_FOUND };

  return { ...SUCCESS };
}
