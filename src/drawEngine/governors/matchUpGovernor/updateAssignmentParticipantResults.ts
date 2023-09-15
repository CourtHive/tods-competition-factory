import { removeExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { tallyParticipantResults } from '../../../matchUpEngine/getters/roundRobinTally/roundRobinTally';
import { getPolicyDefinitions } from '../../../global/functions/deducers/getAppliedPolicies';
import { validMatchUps } from '../../../matchUpEngine/governors/queryGovernor/validMatchUp';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { createSubOrderMap } from './createSubOrderMap';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../constants/policyConstants';
import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { SUB_ORDER, TALLY } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

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

  const result = tallyParticipantResults({
    policyDefinitions,
    matchUpFormat,
    subOrderMap,
    matchUps,
  });
  if (result.error) return result;

  const { participantResults, bracketComplete, report } = result;

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
