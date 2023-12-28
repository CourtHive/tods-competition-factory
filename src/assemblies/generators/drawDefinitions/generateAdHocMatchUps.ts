import { definedAttributes } from '../../../utilities/definedAttributes';
import { isConvertableInteger } from '../../../utilities/math';
import { generateRange } from '../../../utilities/arrays';
import { UUID } from '../../../utilities/UUID';

import { STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';
import { ROUND_OUTCOME } from '../../../constants/drawDefinitionConstants';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
  ErrorType,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  EntryStatusUnion,
  MatchUp,
} from '../../../types/tournamentTypes';

type GenerateAdHocMatchUpsArgs = {
  participantIdPairings?: {
    participantIds: [string | undefined, string | undefined];
  }[];
  drawDefinition: DrawDefinition;
  matchUpsCount?: number; // number of matchUps to be generated
  matchUpIds?: string[];
  roundNumber?: number;
  structureId?: string;
  newRound?: boolean; // optional - whether to auto-increment to the next roundNumber
};

export function generateAdHocMatchUps({
  participantIdPairings,
  matchUpIds = [],
  drawDefinition,
  matchUpsCount,
  roundNumber,
  structureId,
  newRound,
}: GenerateAdHocMatchUpsArgs): {
  matchUpsCount?: number;
  matchUps?: MatchUp[];
  error?: ErrorType;
  info?: any;
} {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };

  if (!structureId && drawDefinition.structures?.length === 1)
    structureId = drawDefinition.structures?.[0]?.structureId;

  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  // if drawDefinition and structureId are provided it is possible to infer roundNumber
  const structure = drawDefinition.structures?.find(
    (structure) => structure.structureId === structureId
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  let structureHasRoundPositions;
  const existingMatchUps = structure.matchUps ?? [];
  const lastRoundNumber = existingMatchUps?.reduce(
    (roundNumber: number, matchUp: any) => {
      if (matchUp.roundPosition) structureHasRoundPositions = true;
      return (matchUp?.roundNumber || 0) > roundNumber
        ? matchUp.roundNumber
        : roundNumber;
    },
    0
  );

  if (!matchUpsCount) {
    const selectedEntries =
      drawDefinition?.entries?.filter((entry) => {
        const entryStatus = entry.entryStatus as EntryStatusUnion;
        return STRUCTURE_SELECTED_STATUSES.includes(entryStatus);
      }) ?? [];
    const roundMatchUpsCount = Math.floor(selectedEntries?.length / 2) || 1;

    if (newRound) {
      matchUpsCount = roundMatchUpsCount;
    } else {
      const targetRoundNumber = roundNumber ?? lastRoundNumber ?? 1;
      const existingRoundMatchUps =
        structure.matchUps?.filter(
          (matchUp) => matchUp.roundNumber === targetRoundNumber
        )?.length ?? 0;
      const maxRemaining = roundMatchUpsCount - existingRoundMatchUps;
      if (maxRemaining > 0) matchUpsCount = maxRemaining;
    }
  }

  if (
    (participantIdPairings && !Array.isArray(participantIdPairings)) ||
    (matchUpsCount && !isConvertableInteger(matchUpsCount)) ||
    (matchUpIds && !Array.isArray(matchUpIds)) ||
    (!participantIdPairings && !matchUpsCount)
  ) {
    return { error: INVALID_VALUES, info: 'matchUpsCount or pairings error' };
  }

  // structure must not be a container of other structures
  // structure must not contain matchUps with roundPosition
  // structure must not determine finishingPosition by ROUND_OUTCOME
  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  if (roundNumber && roundNumber - 1 > (lastRoundNumber || 0))
    return { error: INVALID_VALUES, info: 'roundNumber error' };

  const nextRoundNumber =
    roundNumber ??
    ((newRound && (lastRoundNumber ?? 0) + 1) || lastRoundNumber || 1);

  participantIdPairings =
    participantIdPairings ??
    generateRange(0, matchUpsCount).map(() => ({
      participantIds: [undefined, undefined],
    }));

  const matchUps = participantIdPairings?.map((pairing) => {
    const idStack = pairing?.participantIds ?? [undefined, undefined];
    // ensure there are always 2 sides in generated matchUps
    idStack.push(...[undefined, undefined]);
    const participantIds = idStack.slice(0, 2);
    const sides = participantIds.map((participantId, i) =>
      definedAttributes({
        sideNumber: i + 1,
        participantId,
      })
    );

    return {
      matchUpId: matchUpIds.pop() ?? UUID(),
      roundNumber: nextRoundNumber,
      matchUpStatus: TO_BE_PLAYED,
      sides,
    };
  });

  return { matchUpsCount: matchUps?.length ?? 0, matchUps, ...SUCCESS };
}
