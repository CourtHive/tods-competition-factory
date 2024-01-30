import { xa } from '../../../tools/objects';
import { findExtension } from '../../../acquire/findExtension';
import { instanceCount } from '../../../tools/arrays';
import { ensureInt } from '../../../tools/ensureInt';

import { PARTICIPANT_ID } from '@Constants/attributeConstants';
import { SUB_ORDER } from '@Constants/extensionConstants';

export function createSubOrderMap({ positionAssignments }) {
  const subOrderArray = (positionAssignments || [])
    .filter(xa(PARTICIPANT_ID))
    .map((assignment) => {
      const { extension } = findExtension({
        element: assignment,
        name: SUB_ORDER,
      });
      const value = ensureInt(extension?.value);
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
      })),
  );

  return { subOrderMap };
}
