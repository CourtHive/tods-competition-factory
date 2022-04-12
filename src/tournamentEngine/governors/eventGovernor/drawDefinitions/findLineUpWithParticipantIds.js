import { getParticipantId } from '../../../../global/functions/extractors';
import { findExtension } from '../../queryGovernor/extensionQueries';

import { LINEUPS } from '../../../../constants/extensionConstants';
import {
  INVALID_PARTICIPANT_IDS,
  MISSING_DRAW_DEFINITION,
} from '../../../../constants/errorConditionConstants';

export function findLineUpWithParticipantIds({
  drawDefinition,
  participantIds,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(participantIds)) return { error: INVALID_PARTICIPANT_IDS };

  const { extension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const lineUps = extension?.value || {};
  const keys = Object.keys(lineUps);
  const teamParticipantId = keys?.find((teamParticipantId) =>
    lineUps[teamParticipantId]
      .map(getParticipantId)
      .some((id) => participantIds.includes(id))
  );
  const lineUp = lineUps[teamParticipantId];

  return { lineUp, teamParticipantId };
}
