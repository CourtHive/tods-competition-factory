import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { validateLineUp } from './validateTeamLineUp';

import { LINEUPS } from '../../../constants/extensionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';

// update an extension on the drawDefinition that keeps track of the latest lineUp for all team participantIds
// each matchUp in the draw will use this as the template on first load and then write lineUp to the matchUp

export function updateTeamLineUp({
  drawDefinition,
  participantId,
  tieFormat,
  lineUp,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (typeof participantId !== 'string')
    return { error: MISSING_PARTICIPANT_ID };
  const validation = validateLineUp({ lineUp, tieFormat });
  if (!validation.valid) return validation;

  const { extension: existingExtension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const value = existingExtension?.value || {};
  value[participantId] = lineUp;

  const extension = { name: LINEUPS, value };

  return addExtension({ element: drawDefinition, extension });
}
