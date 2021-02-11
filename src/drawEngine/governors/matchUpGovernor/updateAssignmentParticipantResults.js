import { getPolicyDefinition } from '../../../tournamentEngine/governors/queryGovernor/getPolicyDefinition';
import { tallyParticipantResults } from '../scoreGovernor/roundRobinTally/roundRobinTally';
import { createSubOrderMap } from './createSubOrderMap';
import {
  addExtension,
  removeExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../constants/policyConstants';
import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function updateAssignmentParticipantResults({
  tournamentRecord,
  drawDefinition,
  event,

  positionAssignments,
  matchUpFormat,
  matchUps,
}) {
  if (!Array.isArray(matchUps)) return { error: INVALID_VALUES };
  if (!positionAssignments) return { error: INVALID_VALUES };

  const { policyDefinition } = getPolicyDefinition({
    tournamentRecord,
    drawDefinition,
    event,
    policyType: POLICY_TYPE_ROUND_ROBIN_TALLY,
  });
  const { subOrderMap } = createSubOrderMap({ positionAssignments });

  const { participantResults } = tallyParticipantResults({
    policyDefinition,
    matchUpFormat,
    subOrderMap,
    matchUps,
  });

  const participantIds = Object.keys(participantResults);

  positionAssignments.forEach((assignment) => {
    const { participantId } = assignment;
    if (participantIds.includes(participantId)) {
      let extension = {
        name: 'tally',
        value: participantResults[participantId],
      };
      addExtension({ element: assignment, extension });
      if (!participantResults[participantId].ties) {
        removeExtension({
          element: assignment,
          name: 'subOrder',
        });
      }
    } else {
      removeExtension({
        element: assignment,
        name: 'tally',
      });
      removeExtension({
        element: assignment,
        name: 'subOrder',
      });
    }
  });

  return SUCCESS;
}
