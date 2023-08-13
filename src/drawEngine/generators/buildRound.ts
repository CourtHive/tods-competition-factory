import { generateMatchUpId } from './generateMatchUpId';

import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';

/**
 *
 * @param {boolean=} includeMatchUpType
 * @param {string=} matchUpType
 * @param {number} roundNumber
 * @param {object[]} matchUps
 * @param {string=} idPrefix
 * @param {boolean=} isMock
 * @param {string[]=} uuids
 * @param {object[]=} nodes
 * @returns
 */

type BuildRoundArgs = {
  includeMatchUpType?: boolean;
  matchUpType?: string;
  roundNumber: number;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
  matchUps: any[];
  nodes?: any[];
};

export function buildRound({
  includeMatchUpType,
  matchUpType,
  roundNumber,
  matchUps,
  idPrefix,
  isMock,
  uuids,
  nodes,
}: BuildRoundArgs) {
  let index = 0;
  const roundNodes: any[] = [];
  let roundPosition = 1;
  const matchRoundNumber = roundNumber - 1;
  const roundMatchUpsCount = nodes?.length;

  while (index < (roundMatchUpsCount || 0)) {
    const child1 = nodes?.[index];
    const child2 = nodes?.[index + 1];

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

    const matchUp: any = {
      drawPositions: node.children.map((c) => c?.drawPosition).filter(Boolean),
      matchUpStatus: TO_BE_PLAYED,
      matchUpId: node.matchUpId,
      roundPosition,
      roundNumber,
    };

    // matchUpType is derived for inContext matchUps from structure or drawDefinition
    if (includeMatchUpType && matchUpType) matchUp.matchUpType = matchUpType;
    if (isMock) matchUp.isMock = true;

    matchUps.push(matchUp);
    roundPosition++;
    index += 2;
  }

  return { roundNodes, matchUps };
}
