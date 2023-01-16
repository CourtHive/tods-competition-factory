import { addDrawNotice } from '../../../../drawEngine/notifications/drawNotifications';
import { findExtension } from '../../../../global/functions/deducers/findExtension';
import { addExtension } from '../../../../global/functions/producers/addExtension';
import { removeLineUpSubstitutions } from './removeLineUpSubstitutions';
import { validateLineUp } from './validateTeamLineUp';

import { LINEUPS } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_ID,
} from '../../../../constants/errorConditionConstants';

// update an extension on the drawDefinition that keeps track of the latest lineUp for all team participantIds
// each matchUp in the draw will use this as the template on first load and then write lineUp to the matchUp

/**
 *
 * @param {string} drawId - drawDefinition is resolved by tournamentEngine
 * @param {string} participantId - id of the team for which lineUp is being updated
 * @param {object} tieFormat - optional - valid tieFormat definition; used to validate collectionIds
 * @param {object[]} lineUp - modified lineUp [{ participantId, collectionAssignments }]
 * @returns
 */
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
  value[participantId] = removeLineUpSubstitutions({ lineUp });

  const extension = { name: LINEUPS, value };

  addExtension({ element: drawDefinition, extension });
  addDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
