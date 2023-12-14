import { generateRange, UUID } from '../../utilities';

import {
  MatchUp,
  MatchUpStatusEnum,
  TieFormat,
} from '../../types/tournamentTypes';

type GenerateTieMatchUpsArgs = {
  tieFormat?: TieFormat;
  isMock?: boolean;
  uuids?: string[];
};
export function generateTieMatchUps({
  tieFormat,
  isMock,
  uuids,
}: GenerateTieMatchUpsArgs) {
  const { collectionDefinitions } = tieFormat ?? {};

  const tieMatchUps = (collectionDefinitions ?? [])
    .map((collectionDefinition) =>
      generateCollectionMatchUps({ collectionDefinition, uuids, isMock })
    )
    .filter(Boolean)
    .flat();

  return { tieMatchUps };
}

type GenerateCollectionMatchUpsArgs = {
  collectionPositionOffset?: number;
  collectionDefinition: any;
  matchUpsLimit?: number;
  isMock?: boolean;
  uuids?: string[];
};
export function generateCollectionMatchUps({
  collectionPositionOffset = 0,
  collectionDefinition,
  matchUpsLimit, // internal use allows generation of missing matchUps on "reset"
  isMock,
  uuids,
}: GenerateCollectionMatchUpsArgs): MatchUp[] {
  const { matchUpCount, matchUpType, collectionId, processCodes } =
    collectionDefinition || {};

  const numberToGenerate = matchUpsLimit ?? matchUpCount ?? 0;

  return generateRange(0, numberToGenerate).map((index) => {
    const collectionPosition = collectionPositionOffset + index + 1;
    return {
      sides: [{ sideNumber: 1 }, { sideNumber: 2 }],
      matchUpId: uuids?.pop() ?? UUID(),
      matchUpStatus: MatchUpStatusEnum.ToBePlayed,
      collectionPosition,
      collectionId,
      processCodes,
      matchUpType,
      isMock,
    };
  });
}
