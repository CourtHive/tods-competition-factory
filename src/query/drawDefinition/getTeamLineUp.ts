import { findExtension } from '../../acquire/findExtension';

import { LINEUPS } from '@Constants/extensionConstants';
import { MISSING_DRAW_DEFINITION, MISSING_PARTICIPANT_ID } from '@Constants/errorConditionConstants';

export function getTeamLineUp({ drawDefinition, participantId }) {
  if (typeof drawDefinition !== 'object') return { error: MISSING_DRAW_DEFINITION };
  if (typeof participantId !== 'string') return { error: MISSING_PARTICIPANT_ID };

  const { extension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const lineUps = extension?.value || {};
  const lineUp = lineUps[participantId];

  return { lineUp };
}
