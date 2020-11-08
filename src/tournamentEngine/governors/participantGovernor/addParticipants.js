import { addParticipantsToGrouping } from './participantGroupings';

import { SUCCESS } from '../../../constants/resultConstants';
import { GROUP, TEAM } from '../../../constants/participantTypes';
import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function addParticipant({ tournamentRecord, participant }) {
  const { participantId } = participant || {};
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const idExists = tournamentRecord.participants.reduce(
    (p, c) => c.participant === participantId || p,
    false
  );
  if (!participantId || idExists) return;
  tournamentRecord.participants.push(participant);
  return SUCCESS;
}

export function addParticipants({
  tournamentRecord,
  participants = [],
  source,
  teamId,
  groupId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const existingParticipantIds =
    tournamentRecord.participants?.map(p => p.participantId) || [];
  const newParticipants = participants.filter(
    participant => !existingParticipantIds.includes(participant.participantId)
  );

  if (newParticipants.length) {
    tournamentRecord.participants = tournamentRecord.participants.concat(
      ...newParticipants
    );
    if (source !== undefined) participantSource({ tournamentRecord, source });
    if (teamId || groupId) {
      const groupingType = teamId ? TEAM : GROUP;
      const participantIds = newParticipants.map(np => np.participantId);
      addParticipantsToGrouping({
        groupingType,
        participantIds,
        tournamentRecord,
        groupingParticipantId: teamId || groupId,
        removeFromOtherTeams: true,
      });
    }
    return SUCCESS;
  } else {
    return { error: 'No new participants to add' };
  }
}

function participantSource({ tournamentRecord, source }) {
  if (!tournamentRecord.tournamentProfile)
    tournamentRecord.tournamentProfile = {};
  tournamentRecord.tournamentProfile.participantSource = source;
}
