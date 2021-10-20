import { findExtension } from '../../queryGovernor/extensionQueries';

import { LINEUPS } from '../../../../constants/extensionConstants';
import { TEAM } from '../../../../constants/participantTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  TEAM_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_ID,
} from '../../../../constants/errorConditionConstants';

export function getTeamLineUp({
  tournamentRecord,
  drawDefinition,
  participantId,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (typeof participantId !== 'string')
    return { error: MISSING_PARTICIPANT_ID };

  const participant = (tournamentRecord.participants || []).find(
    (participant) => participant.participantId === participantId
  );

  if (!participant) return { error: TEAM_NOT_FOUND };
  if (participant.participantType !== TEAM)
    return { error: INVALID_PARTICIPANT_TYPE };

  const { extension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const lineUps = extension?.value || {};

  return { lineUp: lineUps[participantId] };
}
