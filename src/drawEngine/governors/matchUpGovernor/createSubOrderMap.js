import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { instanceCount } from '../../../utilities';

export function createSubOrderMap({ positionAssignments }) {
  const subOrderArray = (positionAssignments || [])
    .filter(({ participantId }) => participantId)
    .map((assignment) => {
      const { extension } = findExtension({
        element: assignment,
        name: 'subOrder',
      });
      const subOrder = extension?.value;
      return subOrder && { participantId: assignment.participantId, subOrder };
    })
    .filter((f) => f);

  // we only want subOrders that are unique, and we want them sorted and re-assigned to ordered values
  const subOrders = subOrderArray.map(({ subOrder }) => subOrder);
  const subOrdersCount = instanceCount(subOrders);

  const subOrderMap = Object.assign(
    {},
    ...subOrderArray
      .filter(({ subOrder }) => subOrdersCount[subOrder] === 1)
      .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
      .map(({ participantId }, index) => ({
        [participantId]: index + 1,
      }))
  );

  return { subOrderMap };
}
