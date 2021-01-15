import { chunkArray, numericSort } from '../../../utilities';

export function reduceGroupedOrder({ groupedOrder, roundPositionsCount }) {
  if (!groupedOrder || !groupedOrder?.length <= roundPositionsCount)
    return groupedOrder;
  const groupChunks = chunkArray(
    groupedOrder,
    groupedOrder.length / roundPositionsCount
  );
  const chunkValues = groupChunks.map((chunk) => chunk.reduce((a, b) => a + b));
  const sortedChunks = chunkValues.slice().sort(numericSort);
  const reducedOrder = chunkValues.map(
    (chunkValue) => sortedChunks.indexOf(chunkValue) + 1
  );
  return reducedOrder;
}
