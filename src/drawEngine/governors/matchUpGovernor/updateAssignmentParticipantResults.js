import { getPolicyDefinitions } from '../../../tournamentEngine/governors/queryGovernor/getPolicyDefinitions';
import { tallyParticipantResults } from '../scoreGovernor/roundRobinTally/roundRobinTally';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
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

  const { policyDefinitions } = getPolicyDefinitions({
    tournamentRecord,
    drawDefinition,
    event,
    policyTypes: [POLICY_TYPE_ROUND_ROBIN_TALLY],
  });
  const { subOrderMap } = createSubOrderMap({ positionAssignments });

  const { participantResults } = tallyParticipantResults({
    policyDefinitions,
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

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
