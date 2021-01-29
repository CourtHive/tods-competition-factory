import { getAppliedPolicies } from '../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import { findDrawDefinitionExtension } from '../governors/queryGovernor/extensionQueries';
import { generateDrawDefinition } from './generateDrawDefinition';
import { getDrawDefinition } from '../getters/eventGetter';

import { SUCCESS } from '../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_EVENT,
} from '../../constants/errorConditionConstants';

export function regenerateDrawDefinition({
  tournamentRecord,
  auditData = {},
  drawEngine,
  drawId,
}) {
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  if (!event) return { error: MISSING_EVENT };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const { appliedPolicies: policyDefinitions } = getAppliedPolicies({
    drawDefinition,
  });

  const { extension } = findDrawDefinitionExtension({
    drawDefinition,
    name: 'drawProfile',
  });
  const drawProfile = extension?.value;

  if (drawProfile) {
    const { drawDefinition: newDrawDefinition } = generateDrawDefinition({
      event,
      drawEngine,
      tournamentRecord,
      policyDefinitions,
      drawName: drawDefinition.drawName,
      drawType: drawDefinition.drawType,
      ...drawProfile,
    });

    // TODO: write test to insure that appliedPolicies are copied faithfully

    if (newDrawDefinition) {
      Object.assign(auditData, {
        action: 'Regenerate Draw',
        rejectedDrawDefinition: drawDefinition,
      });

      // auditEngine.addAuditItem({ auditData });
      return SUCCESS;
    }
  } else {
    return { error: 'Draw cannot be regenerated' };
  }
}
