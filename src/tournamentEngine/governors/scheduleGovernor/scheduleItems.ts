import { addMatchUpOfficial as addOfficial } from '../../../mutate/matchUps/schedule/scheduleItems';
import { findParticipant } from '../../../global/functions/deducers/findParticipant';
import { getParticipants } from '../../getters/participants/getParticipants';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import { OFFICIAL } from '../../../constants/participantRoles';
import {
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function addMatchUpOfficial({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  participantId,
  officialType,
  matchUpId,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const tournamentParticipants =
    getParticipants({
      tournamentRecord,
      participantFilters: {
        participantTypes: [INDIVIDUAL],
        participantRoles: [OFFICIAL],
      },
    }).participants ?? [];

  const participant = findParticipant({
    tournamentParticipants,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  return addOfficial({
    drawDefinition,
    disableNotice,
    participantId,
    officialType,
    matchUpId,
  });
}
