import {
  addExtension,
  removeExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { tallyParticipantResults } from '../scoreGovernor/roundRobinTally/roundRobinTally';
import { createSubOrderMap } from './createSubOrderMap';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function updateAssignmentParticipantResults({
  positionAssignments,
  matchUpFormat,
  matchUps,
}) {
  if (!Array.isArray(matchUps)) return { error: INVALID_VALUES };
  if (!positionAssignments) return { error: INVALID_VALUES };

  const { subOrderMap } = createSubOrderMap({ positionAssignments });

  const { participantResults } = tallyParticipantResults({
    matchUpFormat,
    subOrderMap,
    matchUps,
  });

  const participantIds = Object.keys(participantResults);

  positionAssignments.forEach((assignment) => {
    const { participantId } = assignment;
    if (!participantIds.includes(participantId)) {
      removeExtension({
        element: assignment,
        name: 'tally',
      });
      removeExtension({
        element: assignment,
        name: 'subOrder',
      });
    } else {
      let extension = {
        name: 'tally',
        value: participantResults[participantId],
      };
      addExtension({ element: assignment, extension });
      extension = {
        name: 'subOrder',
        value: participantResults[participantId].subOrder,
      };
      addExtension({ element: assignment, extension });
    }
  });

  return SUCCESS;
}
