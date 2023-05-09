import { generateMatchUpId } from './generateMatchUpId';

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
      drawPositions: node.children.map((c) => c?.drawPosition).filter(Boolean),
      matchUpStatus: TO_BE_PLAYED,
      matchUpId: node.matchUpId,
      roundPosition,
      roundNumber,
    };

    // matchUpType is derived for inContext matchUps from structure or drawDefinition
    if (includeMatchUpType) matchUp.matchUpType = matchUpType;
    if (isMock) matchUp.isMock = true;

    matchUps.push(matchUp);
    roundPosition++;
    index += 2;
  }

  return { roundNodes, matchUps };
}
