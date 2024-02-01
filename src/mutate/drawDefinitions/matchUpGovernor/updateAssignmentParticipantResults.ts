import { tallyParticipantResults } from '@Query/matchUps/roundRobinTally/roundRobinTally';
import { getPolicyDefinitions } from '@Query/extensions/getAppliedPolicies';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { removeExtension } from '../../extensions/removeExtension';
import { addExtension } from '../../extensions/addExtension';
import { validMatchUps } from '@Validators/validMatchUp';
import { createSubOrderMap } from './createSubOrderMap';

// constants
import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '@Constants/policyConstants';
import { INVALID_VALUES } from '@Constants/errorConditionConstants';
import { SUB_ORDER, TALLY } from '@Constants/extensionConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function updateAssignmentParticipantResults({
  positionAssignments,
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
  matchUps,
  event,
}) {
  if (!validMatchUps(matchUps)) return { error: INVALID_VALUES };
  if (!positionAssignments) return { error: INVALID_VALUES };

  const { policyDefinitions } = getPolicyDefinitions({
    policyTypes: [POLICY_TYPE_ROUND_ROBIN_TALLY],
    tournamentRecord,
    drawDefinition,
    event,
  });
  const { subOrderMap } = createSubOrderMap({ positionAssignments });

  const result = matchUps.length
    ? tallyParticipantResults({
        policyDefinitions,
        matchUpFormat,
        subOrderMap,
        matchUps,
      })
    : undefined;

  if (result?.error) return result;

  const { participantResults = {}, bracketComplete, report } = result ?? {};

  const participantIds = Object.keys(participantResults);

  positionAssignments.forEach((assignment) => {
    const { participantId } = assignment;
    if (participantIds.includes(participantId)) {
      const extension = {
        value: participantResults[participantId],
        name: TALLY,
      };
      addExtension({ element: assignment, extension });
      if (!participantResults[participantId].ties) {
        removeExtension({
          element: assignment,
          name: SUB_ORDER,
        });
      }
    } else {
      removeExtension({
        element: assignment,
        name: TALLY,
      });
      removeExtension({
        element: assignment,
        name: SUB_ORDER,
      });
    }
  });

  modifyDrawNotice({ drawDefinition });

  return {
    ...SUCCESS,
    participantResults,
    bracketComplete,
    report,
  };
}
