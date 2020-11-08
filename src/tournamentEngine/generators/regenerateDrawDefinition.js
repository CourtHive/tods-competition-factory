import { getDrawDefinition } from '../getters/eventGetter';
import { generateDrawDefinition } from './generateDrawDefinition';
import { getAppliedPolicies } from '../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import { SUCCESS } from '../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_EVENT,
} from '../../constants/errorConditionConstants';

export function regenerateDrawDefinition({
  tournamentRecord,
  auditEngine,
  drawEngine,
  drawId,
  auditData,
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

  if (drawDefinition.drawProfile) {
    const { drawDefinition: newDrawDefinition } = generateDrawDefinition({
      event,
      drawEngine,
      tournamentRecord,
      policyDefinitions,
      ...drawDefinition.drawProfile,
    });

    // TODO: write test to insure that appliedPolicies are copied faithfully

    if (newDrawDefinition) {
      event.drawDefinitions = event.drawDefinitions.map(dd => {
        return dd.drawId === drawId ? newDrawDefinition : dd;
      });

      Object.assign(auditData, {
        action: 'Regenerate Draw',
        rejectedDrawDefinition: drawDefinition,
      });

      auditEngine.addAuditItem({ auditData });
      return SUCCESS;
    }
  } else {
    const errors = drawEngine.getErrors();
    console.log('%c ERRORS:', 'color: red', { errors });
    return { error: 'Draw cannot be regenerated' };
  }
}
