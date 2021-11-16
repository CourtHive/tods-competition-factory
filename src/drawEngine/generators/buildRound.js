import { generateMatchUpId } from './generateMachUpId';

import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';

export function buildRound({
  includeMatchUpType,
  matchUpType,
  roundNumber,
  matchUps,
  idPrefix,
  isMock,
  uuids,
  nodes,
}) {
  let index = 0;
  const roundNodes = [];
  let roundPosition = 1;
  const matchRoundNumber = roundNumber - 1;
  const roundMatchUpsCount = nodes.length;
  while (index < roundMatchUpsCount) {
    const child1 = nodes[index];
    const child2 = nodes[index + 1];

    if (matchRoundNumber) child1.roundNumber = matchRoundNumber;
    if (child2 && matchRoundNumber) child2.roundNumber = matchRoundNumber;

    const matchUpId = generateMatchUpId({
      roundPosition,
      roundNumber,
      idPrefix,
      uuids,
    });

    const node = {
      roundPosition,
      children: [child1, child2],
      matchUpId,
    };
    roundNodes.push(node);
    const matchUp = {
      matchUpId: node.matchUpId,
      roundNumber,
      roundPosition,
      matchUpStatus: TO_BE_PLAYED,
      // TODO: undefined drawPositions can be filtered; several tests will have to be updated
      // UNDEFINED drawPositions
      // drawPositions: node.children.map((c) => c.drawPosition).filter(Boolean),
      drawPositions: node.children.map((c) => c.drawPosition),
    };

    // matchUpType is derived for inContext matchUps from structure or drawDefinition
    if (includeMatchUpType) matchUp.matchUpType = matchUpType;
    if (isMock) matchUp.isMock = true;

    matchUps.push(matchUp);
    index += 2;
    roundPosition++;
  }

  return { roundNodes, matchUps };
}
