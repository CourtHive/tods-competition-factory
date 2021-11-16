import { generateMatchUpId } from './generateMachUpId';
import { generateRange } from '../../utilities';

export function buildFeedRound({
  includeMatchUpType,
  drawPosition,
  matchUpType,
  roundNumber,
  idPrefix,
  matchUps,
  uuids,
  nodes,
  fed,
}) {
  const feedRoundMatchUpsCount = nodes.length;
  const initialGroupDrawPosition = drawPosition
    ? drawPosition - feedRoundMatchUpsCount
    : undefined;
  const drawPositionGroup = generateRange(0, feedRoundMatchUpsCount).map(
    (value) =>
      initialGroupDrawPosition ? initialGroupDrawPosition + value : undefined
  );

  const roundNodes = [];
  for (let nodeIndex = 0; nodeIndex < feedRoundMatchUpsCount; nodeIndex++) {
    const feedDrawPosition = drawPositionGroup.shift();

    const feedArm = {
      feed: true,
      fed: fed + 1,
      drawPosition: feedDrawPosition,
    };

    const position = nodes[nodeIndex];
    position.roundNumber = roundNumber - 1;
    const matchUpId = generateMatchUpId({
      roundPosition: position.roundPosition,
      roundNumber,
      idPrefix,
      uuids,
    });

    const newMatchUp = {
      roundNumber,
      matchUpId,
      roundPosition: position.roundPosition,
      drawPositions: [undefined, feedDrawPosition],
    };

    // matchUpType is derived for inContext matchUps from structure or drawDefinition
    if (includeMatchUpType) newMatchUp.matchUpType = matchUpType;
    matchUps.push(newMatchUp);

    const roundNode = { children: [position, feedArm] };
    roundNodes.push(roundNode);
  }

  const nextDrawPosition = drawPosition
    ? drawPosition - feedRoundMatchUpsCount
    : undefined;

  return { roundNodes, matchUps, drawPosition: nextDrawPosition };
}
