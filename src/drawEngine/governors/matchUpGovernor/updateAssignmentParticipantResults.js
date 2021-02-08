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
