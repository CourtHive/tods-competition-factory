import { findExtension } from '../../queryGovernor/extensionQueries';

import { LINEUPS } from '../../../../constants/extensionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_ID,
} from '../../../../constants/errorConditionConstants';

export function getTeamLineUp({ drawDefinition, participantId }) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (typeof participantId !== 'string')
    return { error: MISSING_PARTICIPANT_ID };

  const { extension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const lineUps = extension?.value || {};
  const lineUp = lineUps[participantId];

  return { lineUp };
}
