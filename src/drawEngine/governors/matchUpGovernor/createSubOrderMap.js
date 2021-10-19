import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { hasParticipantId } from '../../../global/functions/filters';
import { instanceCount } from '../../../utilities';

import { SUB_ORDER } from '../../../constants/extensionConstants';

export function createSubOrderMap({ positionAssignments }) {
  const subOrderArray = (positionAssignments || [])
    .filter(hasParticipantId)
    .map((assignment) => {
      const { extension } = findExtension({
        element: assignment,
        name: SUB_ORDER,
      });
      const value = parseInt(extension?.value);
      const subOrder = !isNaN(value) && value;
      return subOrder && { participantId: assignment.participantId, subOrder };
    })
    .filter(Boolean);

  // we only want subOrders that are unique, and we want them sorted and re-assigned to ordered values
  const subOrders = subOrderArray.map(({ subOrder }) => subOrder);
  const subOrdersCount = instanceCount(subOrders);

  const subOrderMap = Object.assign(
    {},
    ...subOrderArray
      .filter(({ subOrder }) => subOrdersCount[subOrder] === 1)
      .map(({ participantId, subOrder }) => ({
        [participantId]: subOrder,
      }))
  );

  return { subOrderMap };
}
